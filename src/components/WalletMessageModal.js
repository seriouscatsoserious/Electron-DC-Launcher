import React from 'react';
import { X } from 'lucide-react';
import styles from './WalletMessageModal.module.css';

const WalletMessageModal = ({ error, path, chainName, onClose }) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Wallet Directory Information</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.messageContent}>
          <p>
            <strong>Wallet location not found:</strong>
          </p>
          <p>{path}</p>
          <p>
            Please ensure you've run {chainName} through its wallet creation
            process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletMessageModal;
