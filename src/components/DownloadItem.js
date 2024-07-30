import React from 'react';
import styles from './DownloadModal.module.css';


const DownloadItem = ({ chainId, displayName, status, progress }) => (
  <div className={styles.downloadItem}>
    <p>{displayName}: {status} - {progress.toFixed(2)}%</p>
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default DownloadItem;
