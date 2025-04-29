import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ErrorPopup.module.css';

const ErrorPopup = ({ message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (message) {
      setIsClosing(false);
    }
  }, [message]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!message) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.errorPopup} ${isClosing ? styles.fadeOut : ''}`}>
        <button
          type="button"
          onClick={handleClose}
          className={styles.closeButton}
        >
          <X size={18} />
        </button>
        <div className={styles.errorContent}>
          <div className={styles.errorMessage}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
