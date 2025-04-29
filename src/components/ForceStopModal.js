import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ForceStopModal.module.css';

const ForceStopModal = ({ chainName, onConfirm, onClose, dependentChains = [] }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`${styles.modalOverlay} ${styles.dangerOverlay} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Force Stop {chainName}</h2>
        </div>
        <div className={styles.modalBody}>
          <p>Warning - The following chains depend on {chainName}:</p>
          <ul className={styles.dependentList}>
            {dependentChains.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
          <p>
            Force stopping {chainName} will affect these dependent chains and may result in data corruption or loss.
            Are you sure you want to proceed?
          </p>
        </div>
        <div className={styles.buttonContainer}>
          <button 
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className={styles.forceBtn}
            onClick={onConfirm}
          >
            Force Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForceStopModal;
