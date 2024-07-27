import React from 'react';
import { useSelector } from 'react-redux';


const DownloadModal = () => {
  const downloads = useSelector(state => state.downloads);

  if (Object.keys(downloads).length === 0) return null;

  return (
    <div className="download-modal">
      <div className="download-modal-content">
        <h2>Downloads</h2>
        {Object.entries(downloads).map(([chainId, { progress, status }]) => (
          <div key={chainId} className="download-item">
            <p>{chainId}: {status || 'Downloading'} - {progress.toFixed(2)}%</p>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadModal;