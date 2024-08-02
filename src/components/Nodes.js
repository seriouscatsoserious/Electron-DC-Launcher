import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Card from './Card';
import DownloadModal from './DownloadModal';
import WalletMessageModal from './WalletMessageModal';
import { updateDownloads } from '../store/downloadSlice';
import { showDownloadModal } from '../store/downloadModalSlice';

function Nodes() {
  const [chains, setChains] = useState([]);
  const [walletMessage, setWalletMessage] = useState(null);
  const dispatch = useDispatch();

  const fetchChains = useCallback(async () => {
    try {
      const config = await window.electronAPI.getConfig();
      const chainsWithStatus = await Promise.all(
        config.chains.map(async chain => ({
          ...chain,
          status: await window.electronAPI.getChainStatus(chain.id),
          progress: 0,
        }))
      );
      setChains(chainsWithStatus);
    } catch (error) {
      console.error('Failed to fetch chain config:', error);
    }
  }, []);

  const downloadsUpdateHandler = useCallback(
    downloads => {
      console.log('Received downloads update:', downloads);
      dispatch(updateDownloads(downloads));
      setChains(prevChains =>
        prevChains.map(chain => {
          const download = downloads.find(d => d.chainId === chain.id);
          return download
            ? { ...chain, status: download.status, progress: download.progress }
            : chain;
        })
      );
    },
    [dispatch]
  );

  const chainStatusUpdateHandler = useCallback(({ chainId, status }) => {
    setChains(prevChains =>
      prevChains.map(chain =>
        chain.id === chainId ? { ...chain, status } : chain
      )
    );
  }, []);

  const downloadCompleteHandler = useCallback(({ chainId }) => {
    setChains(prevChains =>
      prevChains.map(chain =>
        chain.id === chainId
          ? { ...chain, status: 'downloaded', progress: 100 }
          : chain
      )
    );
  }, []);

  useEffect(() => {
    fetchChains();

    const unsubscribeDownloadsUpdate = window.electronAPI.onDownloadsUpdate(
      downloadsUpdateHandler
    );
    const unsubscribeStatus = window.electronAPI.onChainStatusUpdate(
      chainStatusUpdateHandler
    );
    const unsubscribeDownloadComplete = window.electronAPI.onDownloadComplete(
      downloadCompleteHandler
    );

    window.electronAPI.getDownloads().then(downloadsUpdateHandler);

    return () => {
      if (typeof unsubscribeDownloadsUpdate === 'function')
        unsubscribeDownloadsUpdate();
      if (typeof unsubscribeStatus === 'function') unsubscribeStatus();
      if (typeof unsubscribeDownloadComplete === 'function')
        unsubscribeDownloadComplete();
    };
  }, [
    fetchChains,
    downloadsUpdateHandler,
    chainStatusUpdateHandler,
    downloadCompleteHandler,
  ]);

  const handleOpenWalletDir = useCallback(async chainId => {
    try {
      const result = await window.electronAPI.openWalletDir(chainId);
      if (!result.success) {
        setWalletMessage({
          error: result.error,
          path: result.path,
          chainName: result.chainName,
        });
      }
    } catch (error) {
      console.error(
        `Failed to open wallet directory for chain ${chainId}:`,
        error
      );
      setWalletMessage({
        error: error.message,
        path: '',
        chainName: '',
      });
    }
  }, []);

  const handleUpdateChain = useCallback((chainId, updates) => {
    setChains(prevChains =>
      prevChains.map(chain =>
        chain.id === chainId ? { ...chain, ...updates } : chain
      )
    );
  }, []);

  const handleDownloadChain = useCallback(
    async chainId => {
      try {
        console.log(`Attempting to download chain ${chainId}`);
        await window.electronAPI.downloadChain(chainId);
        console.log(`Download initiated for chain ${chainId}`);
        dispatch(showDownloadModal());
      } catch (error) {
        console.error(`Failed to start download for chain ${chainId}:`, error);
      }
    },
    [dispatch]
  );

  const handleStartChain = useCallback(async chainId => {
    try {
      await window.electronAPI.startChain(chainId);
      setChains(prevChains =>
        prevChains.map(chain =>
          chain.id === chainId ? { ...chain, status: 'running' } : chain
        )
      );
    } catch (error) {
      console.error(`Failed to start chain ${chainId}:`, error);
    }
  }, []);

  const handleStopChain = useCallback(async chainId => {
    try {
      await window.electronAPI.stopChain(chainId);
      setChains(prevChains =>
        prevChains.map(chain =>
          chain.id === chainId ? { ...chain, status: 'stopped' } : chain
        )
      );
    } catch (error) {
      console.error(`Failed to stop chain ${chainId}:`, error);
    }
  }, []);

  const handleResetChain = useCallback(
    async chainId => {
      const chain = chains.find(c => c.id === chainId);
      if (chain.status === 'running') {
        try {
          await handleStopChain(chainId);
        } catch (error) {
          console.error(`Failed to stop chain ${chainId} before reset:`, error);
          return;
        }
      }

      try {
        await window.electronAPI.resetChain(chainId);
      } catch (error) {
        console.error(`Failed to reset chain ${chainId}:`, error);
      }
    },
    [chains, handleStopChain]
  );

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
            onReset={handleResetChain}
            onOpenWalletDir={handleOpenWalletDir}
          />
        ))}
      </div>
      <DownloadModal />
      {walletMessage && (
        <WalletMessageModal
          error={walletMessage.error}
          path={walletMessage.path}
          onClose={() => setWalletMessage(null)}
        />
      )}
    </div>
  );
}

export default Nodes;
