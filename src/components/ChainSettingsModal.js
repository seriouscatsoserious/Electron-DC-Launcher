import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ChainSettingsModal.module.css';
import { FolderOpen } from 'lucide-react';

const ChainSettingsModal = ({ chain, onClose, onOpenDataDir }) => {
  const { isDarkMode } = useTheme();

  const handleOpenDataDir = () => {
    onOpenDataDir(chain.id);
  };

  return (
    <div className={`${styles.modalOverlay} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{chain.display_name} Settings</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>ID:</span>
            <span className={styles.infoValue}>{chain.id}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Version:</span>
            <span className={styles.infoValue}>{chain.version}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Description:</span>
            <span className={styles.infoValue}>{chain.description}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Repository:</span>
            <a href={chain.repo_url} target="_blank" rel="noopener noreferrer" className={styles.repoLink}>
              View Repository
            </a>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Network Port:</span>
            <span className={styles.infoValue}>{chain.network.port}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Chain Type:</span>
            <span className={styles.infoValue}>{chain.chain_type === 0 ? 'Mainchain' : 'Sidechain'}</span>
          </div>
          {chain.chain_type === 1 && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Slot:</span>
              <span className={styles.infoValue}>{chain.slot}</span>
            </div>
          )}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Data Directory:</span>
            <button className={styles.dirButton} onClick={handleOpenDataDir}>
              <FolderOpen size={16} />
              <span>Open Directory</span>
            </button>
          </div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ChainSettingsModal;