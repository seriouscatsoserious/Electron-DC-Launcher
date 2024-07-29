import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import { hideDownloadModal } from '../store/downloadModalSlice';
import DownloadItem from './DownloadItem';
import styles from './DownloadModal.module.css';

const FADE_DELAY = 5000; // 5 seconds

const DownloadModal = () => {
  const downloads = useSelector(state => state.downloads);
  const isVisible = useSelector(state => state.downloadModal.isVisible);
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef(null);
  const modalRef = useRef(null);

  const activeDownloads = Object.entries(downloads).filter(([_, download]) =>
    download.status === 'downloading' || download.status === 'extracting'
  );

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      dispatch(hideDownloadModal());
      setIsClosing(false);
    }, 300); // Duration of fade-out animation
  }, [dispatch]);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    if (isVisible) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set a new timer if there are no active downloads
      if (activeDownloads.length === 0) {
        timerRef.current = setTimeout(closeModal, FADE_DELAY);
      }

      // Add click outside listener
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, activeDownloads.length, closeModal, handleClickOutside]);

  if (!isVisible && !isClosing) return null;

  return (
    <div
      ref={modalRef}
      className={`${styles.downloadModal} ${isDarkMode ? styles.dark : styles.light} ${isClosing ? styles.fadeOut : styles.fadeIn}`}
    >
      <div className={styles.downloadModalContent}>
        <h2>Downloads</h2>
        {activeDownloads.length > 0 ? (
          activeDownloads.map(([chainId, download]) => (
            <DownloadItem key={chainId} chainId={chainId} {...download} />
          ))
        ) : (
          <p>No active downloads</p>
        )}
      </div>
    </div>
  );
};

export default DownloadModal;