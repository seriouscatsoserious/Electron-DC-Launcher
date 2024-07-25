const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');

let mainWindow;
let runningProcesses = {};

// Load config
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// User data path for storing installation locations
const userDataPath = app.getPath('userData');
const installationsPath = path.join(userDataPath, 'installations.json');

// Load or create installations file
let installations = {};
try {
  installations = JSON.parse(fs.readFileSync(installationsPath, 'utf8'));
} catch (error) {
  fs.writeFileSync(installationsPath, JSON.stringify({}));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

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

ipcMain.on('download', async (event, { url, filename, clientName }) => {
  try {
    const { download } = await import('electron-dl');
    const dl = await download(mainWindow, url, {
      directory: app.getPath('downloads'),
      filename: filename,
    });
    
    event.reply('download-progress', 100);
    
    const extractPath = path.join(app.getPath('downloads'), path.parse(filename).name);
    const zip = new AdmZip(dl.getSavePath());
    zip.extractAllTo(extractPath, true);
    
    // Store installation path
    installations[clientName] = extractPath;
    fs.writeFileSync(installationsPath, JSON.stringify(installations));
    
    event.reply('download-complete', { path: extractPath });
  } catch (error) {
    event.reply('download-error', error.message);
  }
});

ipcMain.on('run-app', (event, { clientName }) => {
  if (runningProcesses[clientName]) {
    event.reply('app-already-running', clientName);
    return;
  }

  const clientConfig = config.clients[clientName];
  const installPath = installations[clientName];

  if (!clientConfig || !installPath) {
    event.reply('app-error', { clientName, error: 'Client configuration or installation not found' });
    return;
  }

  const executablePath = path.join(installPath, clientConfig.executablePath);

  let process;
  if (clientConfig.startupMethod === 'executable') {
    process = spawn(executablePath, clientConfig.startupParams, { detached: true });
  } else if (clientConfig.startupMethod === 'script') {
    process = spawn('sh', [executablePath, ...clientConfig.startupParams], { detached: true });
  }

  runningProcesses[clientName] = { process, pid: process.pid };

  process.stdout.on('data', (data) => {
    event.reply('app-output', { clientName, output: data.toString() });
  });

  process.stderr.on('data', (data) => {
    event.reply('app-error', { clientName, error: data.toString() });
  });

  process.on('close', (code) => {
    delete runningProcesses[clientName];
    event.reply('app-closed', { clientName, code });
  });

  event.reply('app-started', clientName);
});

ipcMain.on('stop-app', (event, { clientName }) => {
  const processInfo = runningProcesses[clientName];
  if (processInfo) {
    process.kill(processInfo.pid);
    delete runningProcesses[clientName];
    event.reply('app-stopped', clientName);
  } else {
    event.reply('app-not-running', clientName);
  }
});

ipcMain.on('check-process', (event, { clientName }) => {
  const processInfo = runningProcesses[clientName];
  if (processInfo) {
    try {
      process.kill(processInfo.pid, 0);
      event.reply('process-status', { clientName, status: 'running' });
    } catch (e) {
      delete runningProcesses[clientName];
      event.reply('process-status', { clientName, status: 'stopped' });
    }
  } else {
    event.reply('process-status', { clientName, status: 'stopped' });
  }
});