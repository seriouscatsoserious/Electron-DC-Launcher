import React from 'react';

const Card = ({ chain, onUpdateChain, onDownload, onStart, onStop }) => {
  const handleAction = async () => {
    switch (chain.status) {
      case 'not_downloaded':
        try {
          console.log(`Initiating download for chain ${chain.id}`);
          await onDownload(chain.id);
          // The status update will be handled by the Nodes component based on events from the main process
        } catch (error) {
          console.error('Download failed:', error);
          onUpdateChain(chain.id, { status: 'not_downloaded', progress: 0 });
        }
        break;
      case 'downloaded':
      case 'stopped':
        try {
          console.log(`Starting chain ${chain.id}`);
          await onStart(chain.id);
          // The status update will be handled by the Nodes component
        } catch (error) {
          console.error('Start failed:', error);
        }
        break;
      case 'running':
        try {
          console.log(`Stopping chain ${chain.id}`);
          await onStop(chain.id);
          // The status update will be handled by the Nodes component
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
        return `Downloading ${chain.progress.toFixed(0)}%`;
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