import React from 'react';
import { useDispatch } from 'react-redux';
import { resumeDownload } from '../store/downloadSlice';
import styles from './DownloadModal.module.css';

const DownloadItem = ({ chainId, displayName, status, progress }) => {
  const dispatch = useDispatch();

  const handleResume = () => {
    dispatch(resumeDownload({ chainId }));
  };

  return (
    <div className={styles.downloadItem}>
      <p>
        {displayName}: {status} - {progress.toFixed(2)}%
      </p>
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {status === 'paused' && (
        <button onClick={handleResume} className={styles.resumeButton}>
          Resume
        </button>
      )}
    </div>
  );
};

export default DownloadItem;
