// ChainSettingsModal.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ChainSettingsModal.module.css';
import { X, ExternalLink } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen as faFolderOpenRegular } from '@fortawesome/free-regular-svg-icons';

const ChainSettingsModal = ({ chain, onClose, onOpenDataDir }) => {
  const { isDarkMode } = useTheme();

  const handleOpenRepo = (e) => {
    e.preventDefault();
    window.open(chain.repo_url, '_blank', 'noopener,noreferrer');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={`${styles.modalOverlay} ${isDarkMode ? styles.dark : styles.light}`} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{chain.display_name} Settings</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.label}>ID:</span>
            <span>{chain.id}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Version:</span>
            <span>{chain.version}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Repository:</span>
            <a href={chain.repo_url} onClick={handleOpenRepo} className={styles.link}>
              {chain.repo_url}
              <ExternalLink size={14} className={styles.externalIcon} />
            </a>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Network Port:</span>
            <span>{chain.network.port}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Chain Type:</span>
            <span>{chain.chain_type === 0 ? 'Mainchain' : 'Sidechain'}</span>
          </div>
          {chain.chain_type !== 0 && (
            <div className={styles.infoRow}>
              <span className={styles.label}>Slot:</span>
              <span>{chain.slot}</span>
            </div>
          )}
          <div className={styles.infoRow}>
            <span className={styles.label}>Data Directory:</span>
            <span className={styles.dataDir}>
              {chain.dataDir}
              <button className={styles.dirButton} onClick={() => onOpenDataDir(chain.id)} title="Open data directory">
                <FontAwesomeIcon icon={faFolderOpenRegular} size="sm" />
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainSettingsModal;
