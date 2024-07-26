const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

let electronDl;

(async () => {
  electronDl = await import('electron-dl');
})();

// Load configuration
const configPath = path.join(__dirname, 'chain_config.json');
let config;

async function loadConfig() {
  try {
    const configData = await fs.readFile(configPath, 'utf8');
    config = JSON.parse(configData);
    console.log('Loaded config:', config);
  } catch (error) {
    console.error('Failed to load config:', error);
    app.quit();
  }
}

async function createDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Created new directory: ${dirPath}`);
    return true;
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.log(`Directory already exists: ${dirPath}`);
      return false;
    }
    throw error;
  }
}

async function setupChainDirectories() {
  console.log('Checking chain base directories...');
  const platform = process.platform;
  const homeDir = app.getPath('home');
  let directoriesCreated = 0;

  for (const chain of config.chains) {
    const baseDir = chain.directories.base[platform];
    if (baseDir && typeof baseDir === 'string') {
      const fullBasePath = path.join(homeDir, baseDir);
      const created = await createDirectory(fullBasePath);
      if (created) {
        directoriesCreated++;
        console.log(`Created base directory for ${chain.id}: ${fullBasePath}`);
      }
    } else {
      console.warn(`No valid base directory specified for ${chain.id} on ${platform}`);
    }
  }

  if (directoriesCreated === 0) {
    console.log('All chain directories already exist. No new directories were created.');
  } else {
    console.log(`Created ${directoriesCreated} new chain directories.`);
  }
}

let mainWindow = null;
let downloadProgress = {};
let runningProcesses = {};

function createWindow() {
  if (mainWindow === null) {
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
      },
    });

    mainWindow.loadURL(
      isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`
    );

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }
}

app.whenReady().then(async () => {
  await loadConfig();
  await setupChainDirectories();
  createWindow();

  ipcMain.handle('get-config', async () => {
    return config;
  });

  ipcMain.handle('download-chain', async (event, chainId) => {
    const chain = config.chains.find(c => c.id === chainId);
    if (!chain) throw new Error('Chain not found');

    const url = chain.download.base_url + chain.download.files[process.platform];
    const dir = path.join(app.getPath('home'), chain.directories.base[process.platform]);

    downloadProgress[chainId] = 0;

    try {
      await electronDl.download(BrowserWindow.getFocusedWindow(), url, {        directory: dir,
        onProgress: (progress) => {
          downloadProgress[chainId] = progress.percent * 100;
          event.sender.send('download-progress', { chainId, progress: downloadProgress[chainId] });
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Download failed:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('start-chain', async (event, chainId) => {
    const chain = config.chains.find(c => c.id === chainId);
    if (!chain) throw new Error('Chain not found');

    const dir = path.join(app.getPath('home'), chain.directories.base[process.platform]);
    const executable = path.join(dir, chain.binary[process.platform]);

    try {
      const process = spawn(executable, [], { cwd: dir });
      runningProcesses[chainId] = process;

      process.on('error', (error) => {
        console.error(`Process for ${chainId} encountered an error:`, error);
        event.sender.send('chain-status-update', { chainId, status: 'error', error: error.message });
      });

      process.on('exit', (code) => {
        console.log(`Process for ${chainId} exited with code ${code}`);
        delete runningProcesses[chainId];
        event.sender.send('chain-status-update', { chainId, status: 'stopped' });
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to start chain:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('stop-chain', async (event, chainId) => {
    const process = runningProcesses[chainId];
    if (!process) {
      return { success: false, error: 'Process not found' };
    }

    try {
      process.kill();
      delete runningProcesses[chainId];
      return { success: true };
    } catch (error) {
      console.error('Failed to stop chain:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-chain-status', async (event, chainId) => {
    const chain = config.chains.find(c => c.id === chainId);
    if (!chain) throw new Error('Chain not found');

    const dir = path.join(app.getPath('home'), chain.directories.base[process.platform]);
    const executable = path.join(dir, chain.binary[process.platform]);

    try {
      await fs.access(executable);
      return runningProcesses[chainId] ? 'running' : 'stopped';
    } catch (error) {
      return 'not_downloaded';
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});