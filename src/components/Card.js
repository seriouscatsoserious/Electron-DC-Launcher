import React from 'react';

const Card = ({ chain, onUpdateChain }) => {
  const handleAction = async () => {
    switch (chain.status) {
      case 'not_downloaded':
        try {
          onUpdateChain(chain.id, { status: 'downloading', progress: 0 });
          await window.electronAPI.downloadChain(chain.id);
          onUpdateChain(chain.id, { status: 'downloaded', progress: 100 });
        } catch (error) {
          console.error('Download failed:', error);
          onUpdateChain(chain.id, { status: 'not_downloaded', progress: 0 });
        }
        break;
      case 'downloaded':
      case 'stopped':
        try {
          await window.electronAPI.startChain(chain.id);
          onUpdateChain(chain.id, { status: 'running' });
        } catch (error) {
          console.error('Start failed:', error);
        }
        break;
      case 'running':
        try {
          await window.electronAPI.stopChain(chain.id);
          onUpdateChain(chain.id, { status: 'stopped' });
        } catch (error) {
          console.error('Stop failed:', error);
        }
        break;
    }
  };

  return (
    <div className="card">
      <div className="card-left">
        <button
          className={`btn ${chain.status}`}
          onClick={handleAction}
          disabled={chain.status === 'downloading'}
        >
          {chain.status === 'not_downloaded' && 'Download'}
          {chain.status === 'downloaded' && 'Start'}
          {chain.status === 'running' && 'Stop'}
          {chain.status === 'stopped' && 'Start'}
          {chain.status === 'downloading' && `Downloading ${chain.progress.toFixed(2)}%`}
        </button>
        <h2>{chain.display_name}</h2>
        <p>{chain.description}</p>
        <p>Version: {chain.version}</p>
      </div>
      <div className="card-right">
        <button className="btn settings">Settings</button>
      </div>
    </div>
  );
};

export default Card;