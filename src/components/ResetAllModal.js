import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ChainSettingsModal.module.css';

const ResetAllModal = ({ onConfirm, onClose }) => {
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
          <h2 className={styles.modalTitle}>Reset All Chains</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>Warning: This will reset all chains to their default state and delete ALL data, including:</p>
          <ul>
            <li>Cancel and clean up any active downloads</li>
            <li>All blockchain data</li>
            <li>All wallet data and private keys</li>
            <li>All transaction history</li>
            <li>All custom chain configurations</li>
            <li>All downloaded binaries</li>
          </ul>
          <p className={styles.warningText}>
            This action cannot be undone.
          </p>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.resetBtn}>
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetAllModal;
