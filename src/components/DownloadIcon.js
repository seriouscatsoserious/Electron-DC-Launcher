import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HiOutlineDownload } from 'react-icons/hi';
import { showDownloadModal } from '../store/downloadModalSlice';

import styles from './DownloadIcon.module.css';

const DownloadIcon = () => {
  const dispatch = useDispatch();
  const downloads = useSelector(state => state.downloads);
  const isModalVisible = useSelector(state => state.downloadModal.isVisible);
  const activeDownloads = Object.values(downloads).filter(d => d.status === 'downloading' || d.status === 'extracting');

  const totalProgress = activeDownloads.reduce((sum, download) => sum + download.progress, 0);
  const averageProgress = activeDownloads.length > 0 ? totalProgress / activeDownloads.length : 0;

  const handleClick = () => {
    if (isModalVisible) {
      dispatch(hideDownloadModal());
    } else {
      dispatch(showDownloadModal());
    }
  };

  return (

    <button onClick={handleClick} className={`${styles.iconWrapper} ${styles.downloadIcon}`}>
      <HiOutlineDownload size={20} />
      {activeDownloads.length > 0 && (
        <div className={styles.progressIndicator} style={{ '--progress': `${averageProgress}%` }} />
      )}
    </button>
  );
};

export default DownloadIcon;
