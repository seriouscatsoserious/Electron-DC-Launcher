import React, { useState, useEffect } from 'react';
import Card from './Card';

function Nodes() {
  const [chains, setChains] = useState([]);

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
        setChains(chains => chains.map(chain => 
          chain.id === data.chainId ? { ...chain, progress: data.progress } : chain
        ));
      } else {
        console.error('Received invalid download progress data:', data);
      }
    };

    const chainStatusUpdateHandler = (event, { chainId, status }) => {
      setChains(chains => chains.map(chain => 
        chain.id === chainId ? { ...chain, status } : chain
      ));
    };

    const unsubscribeProgress = window.electronAPI.onDownloadProgress(downloadProgressHandler);
    const unsubscribeStatus = window.electronAPI.onChainStatusUpdate(chainStatusUpdateHandler);

    return () => {
      if (typeof unsubscribeProgress === 'function') unsubscribeProgress();
      if (typeof unsubscribeStatus === 'function') unsubscribeStatus();
    };
  }, []);

  const handleUpdateChain = (chainId, updates) => {
    setChains(chains.map(chain => 
      chain.id === chainId ? { ...chain, ...updates } : chain
    ));
  };

  return (
    <div className="Nodes">
      <h1>Drivechain Launcher</h1>
      <div className="chain-list">
        {chains.map(chain => (
          <Card key={chain.id} chain={chain} onUpdateChain={handleUpdateChain} />
        ))}
      </div>
    </div>
  );
}

export default Nodes;