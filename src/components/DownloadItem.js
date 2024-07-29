import React from 'react';
import styles from './DownloadModal.module.css';

const DownloadItem = ({ chainName, status, progress }) => (
  <div className={styles.downloadItem}>
    <p className={styles.chainName} title={`${chainName}: ${status} - ${progress.toFixed(2)}%`}>
      {chainName}
    </p>
    <p className={styles.statusProgress}>
      {status} - {progress.toFixed(2)}%
    </p>
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default DownloadItem;
