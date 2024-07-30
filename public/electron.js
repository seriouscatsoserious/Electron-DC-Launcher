const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const { promises: fsPromises } = fs;
const isDev = require("electron-is-dev");
const { spawn } = require("child_process");
const AdmZip = require("adm-zip");
const axios = require("axios");

const configPath = path.join(__dirname, "chain_config.json");
let config;
let mainWindow = null;
let runningProcesses = {};

class DownloadManager {
  constructor() {
    this.activeDownloads = new Map();
    this.pausedDownloads = new Map();
  }

  startDownload(chainId, url, basePath) {
    if (this.activeDownloads.has(chainId) || this.pausedDownloads.has(chainId))
      return;

    this.activeDownloads.set(chainId, {
      progress: 0,
      status: "downloading",
      downloadedLength: 0,
    });
    mainWindow.webContents.send("download-started", { chainId });
    this.downloadAndExtract(chainId, url, basePath);
    this.sendDownloadsUpdate();
  }

  async downloadAndExtract(chainId, url, basePath) {
    const zipPath = path.join(basePath, `temp_${chainId}.zip`);

    try {
      console.log(`Starting download for ${chainId} from ${url}`);
      await this.downloadFile(chainId, url, zipPath);
      console.log(
        `Download completed for ${chainId}. File saved at ${zipPath}`
      );

      await this.extractZip(chainId, zipPath, basePath);
      console.log(`Extraction completed for ${chainId}`);

      await fs.promises.unlink(zipPath);

      this.activeDownloads.delete(chainId);
      this.sendDownloadsUpdate();
      mainWindow.webContents.send("download-complete", { chainId });
    } catch (error) {
      console.error(`Error processing ${chainId}:`, error);
      console.error(`Error stack: ${error.stack}`);
      this.activeDownloads.delete(chainId);
      this.pausedDownloads.delete(chainId);
      this.sendDownloadsUpdate();
      mainWindow.webContents.send("download-error", {
        chainId,
        error: error.message,
        stack: error.stack,
      });

      try {
        await fs.promises.unlink(zipPath);
        console.log(`Cleaned up partial download for ${chainId}`);
      } catch (unlinkError) {
        console.error(
          `Failed to delete partial download for ${chainId}:`,
          unlinkError
        );
      }
    }
  }

  async downloadFile(chainId, url, zipPath) {
    return new Promise(async (resolve, reject) => {
      const download = this.activeDownloads.get(chainId) || {
        progress: 0,
        downloadedLength: 0,
      };
      this.activeDownloads.set(chainId, download);

      const writer = fs.createWriteStream(zipPath, { flags: "a" });
      let downloadedLength = download.downloadedLength || 0;

      try {
        const cancelSource = axios.CancelToken.source();
        download.cancelSource = cancelSource;

        const { data, headers } = await axios({
          method: "GET",
          url: url,
          responseType: "stream",
          headers:
            downloadedLength > 0 ? { Range: `bytes=${downloadedLength}-` } : {},
          cancelToken: cancelSource.token,
        });

        const totalLength =
          parseInt(headers["content-length"], 10) + downloadedLength;

        data.on("data", (chunk) => {
          downloadedLength += chunk.length;
          writer.write(chunk);
          const progress = (downloadedLength / totalLength) * 100;
          this.updateDownloadProgress(chainId, progress, downloadedLength);

          if (this.pausedDownloads.has(chainId)) {
            data.pause();
            writer.end();
          }
        });

        data.on("end", () => {
          writer.end();
          if (downloadedLength === totalLength) {
            resolve();
          } else if (!this.pausedDownloads.has(chainId)) {
            reject(
              new Error(
                `Incomplete download: expected ${totalLength} bytes, got ${downloadedLength} bytes`
              )
            );
          } else {
            resolve(); // Resolve if paused, we'll resume later
          }
        });

        writer.on("error", reject);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Download canceled:", error.message);
          resolve(); // Resolve on cancel, as it's an expected behavior
        } else {
          reject(error);
        }
      }
    });
  }

  async extractZip(chainId, zipPath, basePath) {
    console.log(`Starting extraction to ${basePath} for ${chainId}`);
    return new Promise((resolve, reject) => {
      try {
        const zip = new AdmZip(zipPath);
        zip.extractAllToAsync(basePath, true, (error) => {
          if (error) {
            console.error(`Extraction error for ${chainId}: ${error.message}`);
            reject(error);
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error(`Error in extractZip for ${chainId}: ${error.message}`);
        reject(error);
      }
    });
  }

  async pauseDownload(chainId) {
    const download = this.activeDownloads.get(chainId);
    if (download) {
      if (download.cancelSource) {
        download.cancelSource.cancel("Download paused");
      }
      this.pausedDownloads.set(chainId, download);
      this.activeDownloads.delete(chainId);
      this.updateDownloadProgress(
        chainId,
        download.progress,
        download.downloadedLength,
        "paused"
      );
      return true;
    }
    return false;
  }

  async resumeDownload(chainId) {
    const download = this.pausedDownloads.get(chainId);
    if (download) {
      this.activeDownloads.set(chainId, download);
      this.pausedDownloads.delete(chainId);
      this.updateDownloadProgress(
        chainId,
        download.progress,
        download.downloadedLength,
        "downloading"
      );
      const chain = config.chains.find((c) => c.id === chainId);
      if (chain) {
        const url =
          chain.download.base_url + chain.download.files[process.platform];
        const homeDir = app.getPath("home");
        const baseDir = path.join(
          homeDir,
          chain.directories.base[process.platform]
        );
        this.downloadAndExtract(chainId, url, baseDir);
      }
      return true;
    }
    return false;
  }

  updateDownloadProgress(
    chainId,
    progress,
    downloadedLength,
    status = "downloading"
  ) {
    const download =
      this.activeDownloads.get(chainId) || this.pausedDownloads.get(chainId);
    if (download) {
      download.progress = progress;
      download.status = status;
      download.downloadedLength = downloadedLength;
      this.sendDownloadsUpdate();
    }
  }

  sendDownloadsUpdate() {
    if (mainWindow) {
      const downloadsArray = [
        ...this.activeDownloads.entries(),
        ...this.pausedDownloads.entries(),
      ].map(([chainId, download]) => {
        const chain = config.chains.find((c) => c.id === chainId);
        return {
          chainId,
          displayName: chain ? chain.display_name : chainId,
          progress: download.progress,
          status: download.status,
          downloadedLength: download.downloadedLength,
        };
      });
      mainWindow.webContents.send("downloads-update", downloadsArray);
    }
  }
}

const downloadManager = new DownloadManager();

async function loadConfig() {
  try {
    const configData = await fsPromises.readFile(configPath, "utf8");
    config = JSON.parse(configData);
  } catch (error) {
    console.error("Failed to load config:", error);
    app.quit();
  }
}

async function createDirectory(dirPath) {
  try {
    await fsPromises.access(dirPath, fs.constants.F_OK);
    return false;
  } catch (error) {
    if (error.code === "ENOENT") {
      await fsPromises.mkdir(dirPath, { recursive: true });
      return true;
    } else {
      throw error;
    }
  }
}

async function setupChainDirectories() {
  console.log("Checking chain base directories...");
  const platform = process.platform;
  const homeDir = app.getPath("home");
  let directoriesCreated = 0;

  for (const chain of config.chains) {
    const baseDir = chain.directories.base[platform];
    if (baseDir && typeof baseDir === "string") {
      const fullBasePath = path.join(homeDir, baseDir);
      const created = await createDirectory(fullBasePath);
      if (created) {
        directoriesCreated++;
        console.log(`Created base directory for ${chain.id}: ${fullBasePath}`);
      }
    } else {
      console.warn(
        `No valid base directory specified for ${chain.id} on ${platform}`
      );
    }
  }

  if (directoriesCreated === 0) {
    console.log(
      "All chain directories already exist. No new directories were created."
    );
  }
}

function createWindow() {
  if (mainWindow === null) {
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "preload.js"),
      },
    });
    mainWindow.loadURL(
      isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`
    );

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }
}

function getChainConfig(chainId) {
  return config.chains.find((c) => c.id === chainId);
}

async function stopChain(chainId) {
  const process = runningProcesses[chainId];
  if (process) {
    process.kill();
    delete runningProcesses[chainId];
    console.log(`Stopped chain ${chainId}`);
  }
}

app.whenReady().then(async () => {
  await loadConfig();
  await setupChainDirectories();
  createWindow();

  ipcMain.handle("get-config", async () => {
    return config;
  });

  ipcMain.handle("download-chain", async (event, chainId) => {
    const chain = config.chains.find((c) => c.id === chainId);
    if (!chain) throw new Error("Chain not found");

    const url =
      chain.download.base_url + chain.download.files[process.platform];
    const homeDir = app.getPath("home");
    const baseDir = path.join(
      homeDir,
      chain.directories.base[process.platform]
    );

    downloadManager.startDownload(chainId, url, baseDir);
    return { success: true };
  });

  ipcMain.handle("pause-download", async (event, chainId) => {
    const success = await downloadManager.pauseDownload(chainId);
    return { success };
  });

  ipcMain.handle("resume-download", async (event, chainId) => {
    const success = await downloadManager.resumeDownload(chainId);
    return { success };
  });

  ipcMain.handle("get-full-data-dir", async (event, chainId) => {
    const chain = getChainConfig(chainId);
    if (!chain) throw new Error("Chain not found");
    const platform = process.platform;
    const baseDir = chain.directories.base[platform];
    const fullPath = path.join(app.getPath("home"), baseDir);
    return fullPath;
  });

  ipcMain.handle("start-chain", async (event, chainId) => {
    const chain = config.chains.find((c) => c.id === chainId);
    if (!chain) throw new Error("Chain not found");

    const homeDir = app.getPath("home");
    const baseDir = path.join(
      homeDir,
      chain.directories.base[process.platform]
    );

    const binaryPath = chain.binary[process.platform];
    const fullBinaryPath = path.join(baseDir, binaryPath);

    console.log(`Attempting to start binary at: ${fullBinaryPath}`);

    try {
      await fsPromises.access(fullBinaryPath, fs.constants.F_OK);

      if (process.platform !== "win32") {
        await fsPromises.chmod(fullBinaryPath, "755");
      }

      const childProcess = spawn(fullBinaryPath, [], { cwd: baseDir });
      runningProcesses[chainId] = childProcess;

      childProcess.on("error", (error) => {
        console.error(`Process for ${chainId} encountered an error:`, error);
        mainWindow.webContents.send("chain-status-update", {
          chainId,
          status: "error",
          error: error.message,
        });
      });

      childProcess.on("exit", (code) => {
        console.log(`Process for ${chainId} exited with code ${code}`);
        delete runningProcesses[chainId];
        mainWindow.webContents.send("chain-status-update", {
          chainId,
          status: "stopped",
        });
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to start chain:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("stop-chain", async (event, chainId) => {
    const process = runningProcesses[chainId];
    if (!process) {
      return { success: false, error: "Process not found" };
    }

    try {
      process.kill();
      delete runningProcesses[chainId];
      return { success: true };
    } catch (error) {
      console.error("Failed to stop chain:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-chain-status", async (event, chainId) => {
    const chain = config.chains.find((c) => c.id === chainId);
    if (!chain) throw new Error("Chain not found");

    const dir = path.join(
      app.getPath("home"),
      chain.directories.base[process.platform]
    );
    const executable = path.join(dir, chain.binary[process.platform]);

    try {
      await fsPromises.access(executable);
      return runningProcesses[chainId] ? "running" : "stopped";
    } catch (error) {
      return "not_downloaded";
    }
  });

  ipcMain.handle("get-downloads", () => {
    return [
      ...downloadManager.activeDownloads.entries(),
      ...downloadManager.pausedDownloads.entries(),
    ].map(([chainId, download]) => ({
      chainId,
      ...download,
    }));
  });

  ipcMain.handle("open-data-dir", async (event, chainId) => {
    const chain = config.chains.find((c) => c.id === chainId);
    if (!chain) throw new Error("Chain not found");

    const homeDir = app.getPath("home");
    const baseDir = path.join(
      homeDir,
      chain.directories.base[process.platform]
    );

    try {
      await shell.openPath(baseDir);
      return { success: true };
    } catch (error) {
      console.error("Failed to open data directory:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("reset-chain", async (event, chainId) => {
    try {
      const chain = config.chains.find((c) => c.id === chainId);
      if (!chain) throw new Error("Chain not found");

      if (runningProcesses[chainId]) {
        await stopChain(chainId);
      }

      const homeDir = app.getPath("home");
      const baseDir = path.join(
        homeDir,
        chain.directories.base[process.platform]
      );

      await fs.remove(baseDir);
      console.log(`Reset chain ${chainId}: removed directory ${baseDir}`);

      await fs.ensureDir(baseDir);
      console.log(`Recreated empty directory for chain ${chainId}: ${baseDir}`);

      mainWindow.webContents.send("chain-status-update", {
        chainId,
        status: "not_downloaded",
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to reset chain:", error);
      return { success: false, error: error.message };
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
