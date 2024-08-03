const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getConfig: () => ipcRenderer.invoke("get-config"),
  downloadChain: (chainId) => ipcRenderer.invoke("download-chain", chainId),
  startChain: (chainId) => ipcRenderer.invoke("start-chain", chainId),
  stopChain: (chainId) => ipcRenderer.invoke("stop-chain", chainId),
  getChainStatus: (chainId) => ipcRenderer.invoke("get-chain-status", chainId),
  openDataDir: (chainId) => ipcRenderer.invoke("open-data-dir", chainId),
  getFullDataDir: (chainId) => ipcRenderer.invoke("get-full-data-dir", chainId),
  getWalletDir: (chainId) => ipcRenderer.invoke("get-wallet-dir", chainId),
  openWalletDir: (chainId) => ipcRenderer.invoke("open-wallet-dir", chainId),
  getDownloads: () => ipcRenderer.invoke("get-downloads"),
  pauseDownload: (chainId) => ipcRenderer.invoke("pause-download", chainId),
  resumeDownload: (chainId) => ipcRenderer.invoke("resume-download", chainId),
  requestFaucet: (amount, address) =>
    ipcRenderer.invoke("request-faucet", amount, address),
  listClaims: () => ipcRenderer.invoke("list-claims"),
  submitClaim: (destination, amount) =>
    ipcRenderer.invoke("submit-claim", { destination, amount }),
  sendMessage: (channel, data) => {
    let validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receiveMessage: (channel, func) => {
    let validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  resetChain: (chainId) => ipcRenderer.invoke("reset-chain", chainId),
  onChainStatusUpdate: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on("chain-status-update", subscription);
    return () => {
      ipcRenderer.removeListener("chain-status-update", subscription);
    };
  },
  onDownloadsUpdate: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on("downloads-update", subscription);
    return () => {
      ipcRenderer.removeListener("downloads-update", subscription);
    };
  },
  onDownloadComplete: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on("download-complete", subscription);
    return () => {
      ipcRenderer.removeListener("download-complete", subscription);
    };
  },
  onDownloadStarted: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on("download-started", subscription);
    return () => {
      ipcRenderer.removeListener("download-started", subscription);
    };
  },
});

console.log("Preload script has run");
