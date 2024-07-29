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
    }, 300);
  }, [dispatch]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(closeModal, FADE_DELAY);
  }, [closeModal]);

  useEffect(() => {
    if (isVisible) {
      resetTimer();
      
      const handleOutsideClick = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          closeModal();
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);
      
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [isVisible, resetTimer, closeModal]);

  // Reset timer when downloads change
  useEffect(() => {
    if (isVisible) {
      resetTimer();
    }
  }, [downloads, isVisible, resetTimer]);

  const handleInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  if (!isVisible && !isClosing) return null;

  return (
    <div
      ref={modalRef}
      className={`${styles.downloadModal} ${isDarkMode ? styles.dark : styles.light} ${isClosing ? styles.fadeOut : styles.fadeIn}`}
      onMouseEnter={handleInteraction}
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
    >
      <div className={styles.downloadModalContent}>
        <h2>Downloads</h2>
        {activeDownloads.length > 0 ? (
          activeDownloads.map(([chainId, download]) => (
            <DownloadItem
              key={chainId}
              chainName={download.displayName}
              status={download.status}
              progress={download.progress}
            />
          ))
        ) : (
          <p>No active downloads</p>
        )}
      </div>
    </div>
  );
};

export default DownloadModal;