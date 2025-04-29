import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ChainSettingsModal.module.css';
import { X } from 'lucide-react';

const ResetConfirmModal = ({ chainName, chainId, onConfirm, onClose }) => {
  const { isDarkMode } = useTheme();

  const handleOverlayClick = e => {
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
          <h2 className={styles.modalTitle}>Reset {chainName}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {chainId === 'bitwindow' ? (
            <>
              <p className={styles.warningText}>Warning: Resetting BitWindow will also affect Bitcoin Core and Enforcer!</p>
              <p>Are you sure you want to reset BitWindow? This will:</p>
              <ol>
                <li>Stop BitWindow if it's running</li>
                <li>Stop Bitcoin Core and Enforcer if they're running</li>
                <li>Cancel and clean up any active downloads</li>
                <li>Delete all BitWindow data</li>
                <li>Delete all Bitcoin Core and Enforcer data</li>
                <li>Remove any downloaded binaries</li>
              </ol>
              <p><strong>This action cannot be undone and will affect multiple chains!</strong></p>
            </>
          ) : (
            <>
              <p>Are you sure you want to reset this chain? This will:</p>
              <ol>
                <li>Stop the chain if it's running</li>
                <li>Cancel and clean up any active downloads</li>
                <li>Delete all chain data</li>
                <li>Remove any downloaded binaries</li>
              </ol>
              <p><strong>This action cannot be undone.</strong></p>
            </>
          )}
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={onClose} className={`btn ${styles.cancelBtn}`}>
            Cancel
          </button>
          <button onClick={onConfirm} className={`btn ${styles.resetBtn}`}>
            {chainId === 'bitwindow' ? 'Reset Chains' : 'Reset Chain'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmModal;
