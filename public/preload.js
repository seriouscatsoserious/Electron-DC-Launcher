const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  downloadChain: (chainId) => ipcRenderer.invoke('download-chain', chainId),
  startChain: (chainId) => ipcRenderer.invoke('start-chain', chainId),
  stopChain: (chainId) => ipcRenderer.invoke('stop-chain', chainId),
  getChainStatus: (chainId) => ipcRenderer.invoke('get-chain-status', chainId),
  openDataDir: (chainId) => ipcRenderer.invoke('open-data-dir', chainId),
  getFullDataDir: (chainId) => ipcRenderer.invoke('get-full-data-dir', chainId),
  onDownloadsUpdate: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('downloads-update', subscription);
    return () => {
      ipcRenderer.removeListener('downloads-update', subscription);
    };
  },
  onChainStatusUpdate: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('chain-status-update', subscription);
    return () => {
      ipcRenderer.removeListener('chain-status-update', subscription);
    };
  },
  onDownloadComplete: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('download-complete', subscription);
    return () => {
      ipcRenderer.removeListener('download-complete', subscription);
    };
  },
  getDownloads: () => ipcRenderer.invoke('get-downloads'),
  sendMessage: (channel, data) => {
    let validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receiveMessage: (channel, func) => {
    let validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});

console.log("Preload script has run");