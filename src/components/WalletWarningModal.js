import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ChainSettingsModal.module.css';

const WalletWarningModal = ({ onConfirm, onClose }) => {
  const { isDarkMode } = useTheme();
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`${styles.modalOverlay} ${styles.dangerOverlay} ${isDarkMode ? styles.dark : styles.light}`} 
      onClick={handleOverlayClick}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Wallet Directory Access</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>Manually modifying wallet files can lead to:</p>
          <ul>
            <li>Permanent loss of funds</li>
            <li>Wallet data corruption</li>
            <li>Chain synchronization issues</li>
            <li>Security vulnerabilities</li>
          </ul>
          <p className={styles.warningText}>
            Only proceed if you know exactly what you're doing.
          </p>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.resetBtn}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletWarningModal;
