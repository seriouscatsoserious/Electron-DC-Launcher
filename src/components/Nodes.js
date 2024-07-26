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

    const downloadProgressHandler = (event, { chainId, progress }) => {
      setChains(chains => chains.map(chain => 
        chain.id === chainId ? { ...chain, progress } : chain
      ));
    };

    const chainStatusUpdateHandler = (event, { chainId, status }) => {
      setChains(chains => chains.map(chain => 
        chain.id === chainId ? { ...chain, status } : chain
      ));
    };

    window.electronAPI.onDownloadProgress(downloadProgressHandler);
    window.electronAPI.onChainStatusUpdate(chainStatusUpdateHandler);

    return () => {
      // Clean up listeners
      window.electronAPI.onDownloadProgress(downloadProgressHandler);
      window.electronAPI.onChainStatusUpdate(chainStatusUpdateHandler);
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