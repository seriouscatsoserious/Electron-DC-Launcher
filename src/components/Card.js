import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import ChainSettingsModal from './ChainSettingsModal';
import { pauseDownload, resumeDownload } from '../store/downloadSlice';

const Card = ({ chain, onUpdateChain, onDownload, onStart, onStop }) => {
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
      case 'downloading':
        try {
          console.log(`Pausing download for chain ${chain.id}`);
          await window.electronAPI.pauseDownload(chain.id);
          dispatch(pauseDownload({ chainId: chain.id }));
        } catch (error) {
          console.error('Pause failed:', error);
        }
        break;
      case 'paused':
        try {
          console.log(`Resuming download for chain ${chain.id}`);
          await window.electronAPI.resumeDownload(chain.id);
          dispatch(resumeDownload({ chainId: chain.id }));
        } catch (error) {
          console.error('Resume failed:', error);
        }
        break;
    }
  };

  const handleOpenSettings = useCallback(async () => {
    try {
      const fullDataDir = await window.electronAPI.getFullDataDir(chain.id);
      setFullChainData({ ...chain, dataDir: fullDataDir });
      setShowSettings(true);
    } catch (error) {
      console.error('Failed to fetch full data directory:', error);
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
        return 'pause';
      case 'paused':
        return 'resume';
      case 'extracting':
        return 'extracting';
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
        return 'Pause';
      case 'paused':
        return 'Resume';
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
          disabled={chain.status === 'extracting'}
          id={`download-button-${chain.id}`}
        >
          {getButtonText()}
        </button>
        <h2>{chain.display_name}</h2>
        <p>{chain.description}</p>
        {(chain.status === 'downloading' || chain.status === 'paused') && (
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${chain.progress}%` }}
            ></div>
          </div>
        )}
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
        />
      )}
    </div>
  );
};

export default Card;
