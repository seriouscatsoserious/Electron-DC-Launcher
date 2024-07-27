import React from 'react';

const Card = ({ chain, onUpdateChain }) => {
  const handleAction = async () => {
    switch (chain.status) {
      case 'not_downloaded':
        try {
          onUpdateChain(chain.id, { status: 'downloading', progress: 0 });
          const result = await window.electronAPI.downloadChain(chain.id);
          if (result.success) {
            onUpdateChain(chain.id, { status: 'downloaded', progress: 100 });
          } else {
            throw new Error(result.error);
          }
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

  const getButtonClass = () => {
    switch (chain.status) {
      case 'not_downloaded':
        return 'download';
      case 'downloading':
        return 'downloading';
      case 'downloaded':
      case 'stopped':
        return 'run';
      case 'running':
        return 'stop';
      default:
        return '';
    }
  };

  const getButtonText = () => {
    switch (chain.status) {
      case 'not_downloaded':
        return 'Download';
      case 'downloading':
        return 'Downloading';
      case 'downloaded':
      case 'stopped':
        return 'Start';
      case 'running':
        return 'Stop';
      default:
        return '';
    }
  };

  return (
    <div className="card">
      <div className="card-left">
        <button
          className={`btn ${getButtonClass()}`}
          onClick={handleAction}
          disabled={chain.status === 'downloading'}
        >
          {getButtonText()}
        </button>
        {chain.status === 'downloading' && (
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${chain.progress || 0}%` }}
            ></div>
          </div>
        )}
        <h2>{chain.display_name}</h2>
        <p>{chain.description}</p>
        <p>Version: {chain.version}</p>
        {chain.status === 'downloading' && (
          <p>Download progress: {(chain.progress || 0).toFixed(2)}%</p>
        )}
      </div>
      <div className="card-right">
        <button className="btn settings">Settings</button>
      </div>
    </div>
  );
};

export default Card;