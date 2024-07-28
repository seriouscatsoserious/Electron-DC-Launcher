import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ChainSettingsModal.module.css';

const ChainSettingsModal = ({ chain, onClose, onOpenDataDir }) => {
  const { isDarkMode } = useTheme();

  const handleOpenDataDir = () => {
    onOpenDataDir(chain.id);
  };

  return (
    <div className={`${styles.modalOverlay} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.modalContent}>
        <h2>{chain.display_name} Settings</h2>
        <p><strong>ID:</strong> {chain.id}</p>
        <p><strong>Version:</strong> {chain.version}</p>
        <p><strong>Description:</strong> {chain.description}</p>
        <p><strong>Repository:</strong> <a href={chain.repo_url} target="_blank" rel="noopener noreferrer">{chain.repo_url}</a></p>
        <p><strong>Network Port:</strong> {chain.network.port}</p>
        <p><strong>Chain Type:</strong> {chain.chain_type === 0 ? 'Mainchain' : 'Sidechain'}</p>
        {chain.chain_type === 1 && <p><strong>Slot:</strong> {chain.slot}</p>}
        <button className={styles.button} onClick={handleOpenDataDir}>Open Data Directory</button>
        <button className={styles.button} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ChainSettingsModal;