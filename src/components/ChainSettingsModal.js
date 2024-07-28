import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ChainSettingsModal.module.css';
import { X, FolderOpen, ExternalLink } from 'lucide-react';

const ChainSettingsModal = ({ chain, onClose, onOpenDataDir }) => {
  const { isDarkMode } = useTheme();

  const handleOpenDataDir = () => {
    onOpenDataDir(chain.id);
  };

  const handleOpenRepo = (e) => {
    e.preventDefault();
    window.open(chain.repo_url, '_blank', 'noopener,noreferrer');
  };

  // Determine the current platform
  const platform = window.electronAPI?.platform || 'linux'; // Default to 'linux' if not available

  // Get the base directory for the current platform
  const baseDir = chain.directories?.base?.[platform] || 'Path not available';

  return (
    <div className={`${styles.modalOverlay} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className={styles.modalTitle}>{chain.display_name} Settings</h2>
        <div className={styles.infoGrid}>
          <p><strong>ID:</strong> {chain.id}</p>
          <p><strong>Version:</strong> {chain.version}</p>
          <p><strong>Description:</strong> {chain.description}</p>
          <p>
            <strong>Repository:</strong>
            <a href={chain.repo_url} onClick={handleOpenRepo} className={styles.link}>
              {chain.repo_url} <ExternalLink size={14} />
            </a>
          </p>
          <p><strong>Network Port:</strong> {chain.network.port}</p>
          <p><strong>Chain Type:</strong> {chain.chain_type === 0 ? 'Mainchain' : 'Sidechain'}</p>
          {chain.chain_type !== 0 && <p><strong>Slot:</strong> {chain.slot}</p>}
          <p>
            <strong>Data Directory:</strong>
            <span className={styles.dataDir}>
              {baseDir}
              <button className={styles.dirButton} onClick={handleOpenDataDir} title="Open data directory">
                <FolderOpen size={16} />
              </button>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChainSettingsModal;