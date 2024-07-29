import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Card from './Card';
import DownloadModal from './DownloadModal';
import ChainSettingsModal from './ChainSettingsModal';
import { updateDownloads } from '../store/downloadSlice';

function Nodes() {
  const [chains, setChains] = useState([]);
  const [selectedChain, setSelectedChain] = useState(null); // State to manage the selected chain
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal open/close
  const dispatch = useDispatch();

  const fetchChains = useCallback(async () => {
    try {
      const config = await window.electronAPI.getConfig();
      const chainsWithStatus = await Promise.all(config.chains.map(async chain => ({
        ...chain,
        status: await window.electronAPI.getChainStatus(chain.id),
        progress: 0
      })));
      setChains(chainsWithStatus);
    } catch (error) {
      console.error('Failed to fetch chain config:', error);
    }
  }, []);

  const downloadsUpdateHandler = useCallback((downloads) => {
    console.log('Received downloads update:', downloads);
    dispatch(updateDownloads(downloads));
    setChains(prevChains => prevChains.map(chain => {
      const download = downloads.find(d => d.chainId === chain.id);
      return download ? { ...chain, status: download.status, progress: download.progress } : chain;
    }));
  }, [dispatch]);

  const chainStatusUpdateHandler = useCallback(({ chainId, status }) => {
    setChains(prevChains => prevChains.map(chain =>
      chain.id === chainId ? { ...chain, status } : chain
    ));
  }, []);

  const downloadCompleteHandler = useCallback(({ chainId }) => {
    setChains(prevChains => prevChains.map(chain =>
      chain.id === chainId ? { ...chain, status: 'downloaded', progress: 100 } : chain
    ));
  }, []);

  useEffect(() => {
    fetchChains();

    const unsubscribeDownloadsUpdate = window.electronAPI.onDownloadsUpdate(downloadsUpdateHandler);
    const unsubscribeStatus = window.electronAPI.onChainStatusUpdate(chainStatusUpdateHandler);
    const unsubscribeDownloadComplete = window.electronAPI.onDownloadComplete(downloadCompleteHandler);

    // Initial downloads fetch
    window.electronAPI.getDownloads().then(downloadsUpdateHandler);

    return () => {
      if (typeof unsubscribeDownloadsUpdate === 'function') unsubscribeDownloadsUpdate();
      if (typeof unsubscribeStatus === 'function') unsubscribeStatus();
      if (typeof unsubscribeDownloadComplete === 'function') unsubscribeDownloadComplete();
    };
  }, [fetchChains, downloadsUpdateHandler, chainStatusUpdateHandler, downloadCompleteHandler]);

  const handleUpdateChain = useCallback((chainId, updates) => {
    setChains(prevChains => prevChains.map(chain =>
      chain.id === chainId ? { ...chain, ...updates } : chain
    ));
  }, []);

  const handleDownloadChain = useCallback(async (chainId) => {
    try {
      console.log(`Attempting to download chain ${chainId}`);
      await window.electronAPI.downloadChain(chainId);
      console.log(`Download initiated for chain ${chainId}`);
    } catch (error) {
      console.error(`Failed to start download for chain ${chainId}:`, error);
    }
  }, []);

  const handleStartChain = useCallback(async (chainId) => {
    try {
      await window.electronAPI.startChain(chainId);
      setChains(prevChains => prevChains.map(chain =>
        chain.id === chainId ? { ...chain, status: 'running' } : chain
      ));
    } catch (error) {
      console.error(`Failed to start chain ${chainId}:`, error);
    }
  }, []);

  const handleStopChain = useCallback(async (chainId) => {
    try {
      await window.electronAPI.stopChain(chainId);
      setChains(prevChains => prevChains.map(chain =>
        chain.id === chainId ? { ...chain, status: 'stopped' } : chain
      ));
    } catch (error) {
      console.error(`Failed to stop chain ${chainId}:`, error);
    }
  }, []);

  // Handler to open the modal
  const handleOpenSettings = useCallback(async (chainId) => {
    try {
      const chain = chains.find(chain => chain.id === chainId);
      const fullDataDir = await window.electronAPI.getFullDataDir(chainId);
      setSelectedChain({ ...chain, dataDir: fullDataDir });
      setIsModalOpen(true);
    } catch (error) {
      console.error(`Failed to open settings for chain ${chainId}:`, error);
    }
  }, [chains]);

  // Handler to close the modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedChain(null);
  }, []);

  return (
    <div className="Nodes">
      <h1>Drivechain Launcher</h1>
      <div className="chain-list">
        {chains.map(chain => (
          <Card 
            key={chain.id} 
            chain={chain} 
            onUpdateChain={handleUpdateChain}
            onDownload={handleDownloadChain}
            onStart={handleStartChain}
            onStop={handleStopChain}
            onOpenSettings={handleOpenSettings} // Pass the handler to the Card component
          />
        ))}
      </div>
      {isModalOpen && selectedChain && (
        <ChainSettingsModal 
          chain={selectedChain} 
          onClose={handleCloseModal} 
          onOpenDataDir={(id) => window.electronAPI.openDataDir(id)} 
        />
      )}
      <DownloadModal />
    </div>
  );
}

export default Nodes;
