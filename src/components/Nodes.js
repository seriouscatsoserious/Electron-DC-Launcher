import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Card from './Card';
import DownloadModal from './DownloadModal';
import { updateDownloadQueue } from '../store/downloadSlice';

function Nodes() {
  const [chains, setChains] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchChains = async () => {
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
    };

    fetchChains();

    const downloadProgressHandler = (data) => {
      if (data && data.chainId && typeof data.progress === 'number') {
        console.log(`Download progress for chain ${data.chainId}: ${data.progress}%`);
        dispatch(updateDownloadQueue({ chainId: data.chainId, status: 'downloading', progress: data.progress }));
        setChains(chains => chains.map(chain =>
          chain.id === data.chainId ? { ...chain, status: 'downloading', progress: data.progress } : chain
        ));
      } else {
        console.error('Received invalid download progress data:', data);
      }
    };

    const downloadQueueUpdateHandler = (queue) => {
      console.log('Received download queue update:', queue);
      queue.forEach(item => {
        dispatch(updateDownloadQueue(item));
        setChains(chains => chains.map(chain =>
          chain.id === item.chainId ? { ...chain, status: item.status, progress: item.progress } : chain
        ));
      });
    };

    const chainStatusUpdateHandler = ({ chainId, status }) => {
      setChains(chains => chains.map(chain =>
        chain.id === chainId ? { ...chain, status } : chain
      ));
    };

    const downloadCompleteHandler = ({ chainId }) => {
      dispatch(updateDownloadQueue({ chainId, status: 'completed', progress: 100 }));
      setChains(chains => chains.map(chain =>
        chain.id === chainId ? { ...chain, status: 'downloaded', progress: 100 } : chain
      ));
    };

    const unsubscribeProgress = window.electronAPI.onDownloadProgress(downloadProgressHandler);
    const unsubscribeQueueUpdate = window.electronAPI.onDownloadQueueUpdate(downloadQueueUpdateHandler);
    const unsubscribeStatus = window.electronAPI.onChainStatusUpdate(chainStatusUpdateHandler);
    const unsubscribeDownloadComplete = window.electronAPI.onDownloadComplete(downloadCompleteHandler);

    return () => {
      if (typeof unsubscribeProgress === 'function') unsubscribeProgress();
      if (typeof unsubscribeStatus === 'function') unsubscribeStatus();
      if (typeof unsubscribeDownloadComplete === 'function') unsubscribeDownloadComplete();
      if (typeof unsubscribeProgress === 'function') unsubscribeProgress();
      if (typeof unsubscribeQueueUpdate === 'function') unsubscribeQueueUpdate();
    };
  }, [dispatch]);

  const handleUpdateChain = (chainId, updates) => {
    setChains(chains => chains.map(chain =>
      chain.id === chainId ? { ...chain, ...updates } : chain
    ));
  };

  const handleDownloadChain = async (chainId) => {
    try {
      console.log(`Attempting to download chain ${chainId}`);
      await window.electronAPI.downloadChain(chainId);
      console.log(`Download initiated for chain ${chainId}`);
      setChains(chains => chains.map(chain =>
        chain.id === chainId ? { ...chain, status: 'downloading', progress: 0 } : chain
      ));
    } catch (error) {
      console.error(`Failed to start download for chain ${chainId}:`, error);
    }
  };

  const handleStartChain = async (chainId) => {
    try {
      await window.electronAPI.startChain(chainId);
      setChains(chains => chains.map(chain =>
        chain.id === chainId ? { ...chain, status: 'running' } : chain
      ));
    } catch (error) {
      console.error(`Failed to start chain ${chainId}:`, error);
    }
  };

  const handleStopChain = async (chainId) => {
    try {
      await window.electronAPI.stopChain(chainId);
      setChains(chains => chains.map(chain =>
        chain.id === chainId ? { ...chain, status: 'stopped' } : chain
      ));
    } catch (error) {
      console.error(`Failed to stop chain ${chainId}:`, error);
    }
  };

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
          />
        ))}
      </div>
      <DownloadModal />
    </div>
  );
}

export default Nodes;