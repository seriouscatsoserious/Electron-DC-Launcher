const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

// Load configuration
const configPath = path.join(__dirname, 'chain_config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function setupChainDirectories() {
  const platform = process.platform;
  const homeDir = app.getPath('home');

  config.chains.forEach(chain => {
    const baseDir = chain.directories.base[platform];
    if (baseDir && typeof baseDir === 'string') {
      const fullBasePath = path.join(homeDir, baseDir);
      createDirectory(fullBasePath);

      if (chain.directories.wallet && typeof chain.directories.wallet === 'string') {
        const walletPath = path.join(fullBasePath, chain.directories.wallet);
        createDirectory(walletPath);
      } else if (chain.directories.wallet) {
        console.warn(`Invalid wallet directory for ${chain.id}: ${chain.directories.wallet}`);
      }
    } else {
      console.warn(`No valid base directory specified for ${chain.id} on ${platform}`);
    }
  });
}

function createWindow() {
  setupChainDirectories();
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {      
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
}

app.whenReady().then(createWindow);
app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('get-config', async () => {
    return config; // This is the config you've already loaded
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