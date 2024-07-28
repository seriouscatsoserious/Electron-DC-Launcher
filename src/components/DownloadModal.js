import React, { useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';

const ProgressBar = memo(({ progress }) => (
  <div className="progress-bar-container">
    <div
      className="progress-bar"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
));

const DownloadItem = memo(({ chainId, status, progress }) => (
  <div className="download-item">
    <p>{chainId}: {status} - {progress.toFixed(2)}%</p>
    <ProgressBar progress={progress} />
  </div>
));

const DownloadModal = () => {
  const downloads = useSelector(useCallback(state => state.downloads, []));
  const { isDarkMode } = useTheme();
  
  if (Object.keys(downloads).length === 0) return null;

  return (
    <div className={`download-modal ${isDarkMode ? 'dark' : 'light'}`}>      <div className="download-modal-content">
        <h2>Downloads</h2>
        {Object.entries(downloads).map(([chainId, download]) => (
          <DownloadItem key={chainId} chainId={chainId} {...download} />
        ))}
      </div>
    </div>
  );
};

export default DownloadModal;