import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Download } from 'lucide-react';
import { showDownloadModal, hideDownloadModal } from '../store/downloadModalSlice';
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
    <div className={`${styles.iconWrapper} ${styles.downloadIcon}`} onClick={handleClick}>
      <Download size={20} />
      {activeDownloads.length > 0 && (
        <div className={styles.progressIndicator} style={{ '--progress': `${averageProgress}%` }} />
      )}
    </div>
  );
};

export default DownloadIcon;