import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const Card = ({ data }) => {
  const [buttonState, setButtonState] = useState('download');
  const [blockHeight, setBlockHeight] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    // Simulating fetching block height
    const fetchBlockHeight = async () => {
      const height = Math.floor(Math.random() * 100000);
      setBlockHeight(height);
    };
    fetchBlockHeight();

    // Set up IPC listeners
    ipcRenderer.on('download-progress', (event, progress) => {
      setDownloadProgress(progress);
    });

    ipcRenderer.on('download-complete', (event, { path }) => {
      setButtonState('run');
    });

    ipcRenderer.on('download-error', (event, error) => {
      console.error('Download error:', error);
      setButtonState('download');
    });

    ipcRenderer.on('app-started', (event, clientName) => {
      if (clientName === data.title) {
        setButtonState('stop');
      }
    });

    ipcRenderer.on('app-stopped', (event, clientName) => {
      if (clientName === data.title) {
        setButtonState('run');
      }
    });

    // Check process status periodically
    const intervalId = setInterval(() => {
      ipcRenderer.send('check-process', { clientName: data.title });
    }, 5000);

    ipcRenderer.on('process-status', (event, { clientName, status }) => {
      if (clientName === data.title) {
        setButtonState(status === 'running' ? 'stop' : 'run');
      }
    });

    return () => {
      clearInterval(intervalId);
      ipcRenderer.removeAllListeners('download-progress');
      ipcRenderer.removeAllListeners('download-complete');
      ipcRenderer.removeAllListeners('download-error');
      ipcRenderer.removeAllListeners('app-started');
      ipcRenderer.removeAllListeners('app-stopped');
      ipcRenderer.removeAllListeners('process-status');
    };
  }, [data.title]);

  const handleButtonClick = () => {
    switch (buttonState) {
      case 'download':
        setButtonState('downloading');
        ipcRenderer.send('download', { url: data.downloadLink, filename: `${data.title}.zip`, clientName: data.title });
        break;
      case 'run':
        ipcRenderer.send('run-app', { clientName: data.title });
        break;
      case 'stop':
        ipcRenderer.send('stop-app', { clientName: data.title });
        break;
      default:
        break;
    }
  };

  return (
    <div className="card">
      <div className="card-left">
        <button
          className={`btn ${buttonState}`}
          onClick={handleButtonClick}
          disabled={buttonState === 'downloading'}
        >
          {buttonState === 'downloading' ? `Downloading ${downloadProgress}%` : buttonState.charAt(0).toUpperCase() + buttonState.slice(1)}
        </button>
        <h2>{data.title}</h2>
        <p>{data.description}</p>
        {blockHeight && <p>Block height: {blockHeight}</p>}
      </div>
      <div className="card-right">
        <button className="btn settings">Settings</button>
      </div>
    </div>
  );
};

export default Card;