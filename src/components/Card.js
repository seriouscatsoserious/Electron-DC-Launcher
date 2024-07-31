import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import ChainSettingsModal from './ChainSettingsModal';
import { pauseDownload, resumeDownload } from '../store/downloadSlice';

const Card = ({
  chain,
  onUpdateChain,
  onDownload,
  onStart,
  onStop,
  onOpenWalletDir,
  onReset,
}) => {
  const { isDarkMode } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [fullChainData, setFullChainData] = useState(chain);
  const dispatch = useDispatch();

  const handleAction = async () => {
    switch (chain.status) {
      case 'not_downloaded':
        try {
          console.log(`Initiating download for chain ${chain.id}`);
          await onDownload(chain.id);
        } catch (error) {
          console.error('Download failed:', error);
          onUpdateChain(chain.id, { status: 'not_downloaded', progress: 0 });
        }
        break;
      case 'downloaded':
      case 'stopped':
        try {
          console.log(`Starting chain ${chain.id}`);
          await onStart(chain.id);
        } catch (error) {
          console.error('Start failed:', error);
        }
        break;
      case 'running':
        try {
          console.log(`Stopping chain ${chain.id}`);
          await onStop(chain.id);
        } catch (error) {
          console.error('Stop failed:', error);
        }
        break;
    }
  };

  const handleOpenSettings = useCallback(async () => {
    try {
      const fullDataDir = await window.electronAPI.getFullDataDir(chain.id);
      const walletDir = await window.electronAPI.getWalletDir(chain.id);
      setFullChainData({
        ...chain,
        dataDir: fullDataDir,
        walletDir: walletDir,
      });
      setShowSettings(true);
    } catch (error) {
      console.error('Failed to fetch directories:', error);
    }
  }, [chain]);

  const handleOpenDataDir = async chainId => {
    try {
      await window.electronAPI.openDataDir(chainId);
    } catch (error) {
      console.error('Failed to open data directory:', error);
    }
  };

  const getButtonClass = () => {
    switch (chain.status) {
      case 'not_downloaded':
        return 'download';
      case 'downloading':
      case 'extracting':
        return 'downloading';
      case 'downloaded':
      case 'stopped':
        return 'run';
      case 'running':
        return 'stop';
      default:
        return '';
    }
  };

  const getButtonText = () => {
    switch (chain.status) {
      case 'not_downloaded':
        return 'Download';
      case 'downloading':
        return 'Downloading';
      case 'extracting':
        return 'Extracting';
      case 'downloaded':
      case 'stopped':
        return 'Start';
      case 'running':
        return 'Stop';
      default:
        return '';
    }
  };

  return (
    <div className={`card ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="card-left">
        <button
          className={`btn ${getButtonClass()}`}
          onClick={handleAction}
          disabled={
            chain.status === 'downloading' || chain.status === 'extracting'
          }
          id={`download-button-${chain.id}`}
        >
          {getButtonText()}
        </button>
        <h2>{chain.display_name}</h2>
        <p>{chain.description}</p>
      </div>
      <div className="card-right">
        <button className="btn settings" onClick={handleOpenSettings}>
          Settings
        </button>
      </div>
      {showSettings && (
        <ChainSettingsModal
          chain={fullChainData}
          onClose={() => setShowSettings(false)}
          onOpenDataDir={handleOpenDataDir}
          onOpenWalletDir={onOpenWalletDir}
          onReset={onReset}
        />
      )}
    </div>
  );
};

export default Card;
