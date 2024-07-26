const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

// Load configuration
const configPath = path.join(__dirname, 'chain_config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
console.log('Loaded config:', config);

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created new directory: ${dirPath}`);
    return true;
  } else {
    console.log(`Directory already exists: ${dirPath}`);
    return false;
  }
}

function setupChainDirectories() {
  console.log('Checking chain base directories...');
  const platform = process.platform;
  const homeDir = app.getPath('home');
  let directoriesCreated = 0;

  config.chains.forEach(chain => {
    const baseDir = chain.directories.base[platform];
    if (baseDir && typeof baseDir === 'string') {
      const fullBasePath = path.join(homeDir, baseDir);
      const created = createDirectory(fullBasePath);
      if (created) {
        directoriesCreated++;
        console.log(`Created base directory for ${chain.id}: ${fullBasePath}`);
      }
    } else {
      console.warn(`No valid base directory specified for ${chain.id} on ${platform}`);
    }
  });

  if (directoriesCreated === 0) {
    console.log('All chain directories already exist. No new directories were created.');
  } else {
    console.log(`Created ${directoriesCreated} new chain directories.`);
  }
}

let mainWindow = null;

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

app.whenReady().then(() => {
  setupChainDirectories();
  createWindow();

  ipcMain.handle('get-config', async () => {
    return config;
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