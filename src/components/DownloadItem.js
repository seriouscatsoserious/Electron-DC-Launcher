// src/components/DownloadItem.js
import React from 'react';
import styles from './DownloadModal.module.css';

const DownloadItem = ({ chainId, status, progress }) => (
  <div className={styles.downloadItem}>
    <p>{chainId}: {status} - {progress.toFixed(2)}%</p>
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default DownloadItem;