import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from './Card';
import styles from './Nodes.module.css';
import UnreleasedCard from './UnreleasedCard';
import DownloadModal from './DownloadModal';
import WalletMessageModal from './WalletMessageModal';
import { updateDownloads, updateIBDStatus } from '../store/downloadSlice';
import { showDownloadModal } from '../store/downloadModalSlice';
import { setChains, updateChainStatus } from '../store/chainsSlice';

function Nodes() {
  const chains = useSelector(state => state.chains);
  const showQuotes = useSelector(state => state.settings.showQuotes);
  const [walletMessage, setWalletMessage] = useState(null);
  const [bitcoinSync, setBitcoinSync] = useState(null);
  const [runningNodes, setRunningNodes] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchChains = useCallback(async () => {
    try {
      setIsLoading(true);
      const config = await window.electronAPI.getConfig();
      const dependencyData = await import('../CardData.json');
      
      const chainsWithStatus = await Promise.all(
        config.chains
          .filter(chain => chain.enabled)
          .map(async chain => {
            const dependencyInfo = dependencyData.default.find(d => d.id === chain.id);
            console.log('Loading chain:', chain.id, 'Released status:', chain.released);
            return {
              ...chain,
              dependencies: dependencyInfo?.dependencies || [],
              status: await window.electronAPI.getChainStatus(chain.id),
              progress: 0,
              released: chain.released,
            };
          })
      );
      dispatch(setChains(chainsWithStatus));
      
      const initialRunning = chainsWithStatus
        .filter(chain => chain.status === 'running' || chain.status === 'ready')
        .map(chain => chain.id);
      setRunningNodes(initialRunning);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to fetch chain config:', error);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const downloadsUpdateHandler = useCallback(
    downloads => {
      console.log('Received downloads update:', downloads);
      
      // Create a copy of downloads to modify
      let updatedDownloads = [...downloads];
      
      // Check for BitWindow, Bitcoin, and Enforcer downloads
      const bitwindowDownload = downloads.find(d => d.chainId === 'bitwindow');
      const bitcoinDownload = downloads.find(d => d.chainId === 'bitcoin');
      const enforcerDownload = downloads.find(d => d.chainId === 'enforcer');
      
      // Check if any of the three components are downloading
      const anyComponentDownloading = 
        (bitcoinDownload && (bitcoinDownload.status === 'downloading' || bitcoinDownload.status === 'extracting')) ||
        (enforcerDownload && (enforcerDownload.status === 'downloading' || enforcerDownload.status === 'extracting')) ||
        (bitwindowDownload && (bitwindowDownload.status === 'downloading' || bitwindowDownload.status === 'extracting'));
      
      // If BitWindow exists in the downloads or any component is downloading, update BitWindow
      if (bitwindowDownload || anyComponentDownloading) {
        // Calculate progress based on the sequential download process
        let cumulativeProgress = 0;
        
        // Since we download in sequence (Bitcoin -> Enforcer -> BitWindow),
        // we'll calculate progress as a continuous sequence
        
        // Step 1: Bitcoin (0-33%)
        if (bitcoinDownload && (bitcoinDownload.status === 'downloading' || bitcoinDownload.status === 'extracting')) {
          // Bitcoin is downloading - progress is 0-33% based on Bitcoin's progress
          cumulativeProgress = (bitcoinDownload.progress / 100) * 33;
        } else {
          // Bitcoin is done - progress is at least 33%
          cumulativeProgress = 33;
          
          // Step 2: Enforcer (33-66%)
          if (enforcerDownload && (enforcerDownload.status === 'downloading' || enforcerDownload.status === 'extracting')) {
            // Enforcer is downloading - add 0-33% based on Enforcer's progress
            cumulativeProgress += (enforcerDownload.progress / 100) * 33;
          } else {
            // Enforcer is done - progress is at least 66%
            cumulativeProgress = 66;
            
            // Step 3: BitWindow (66-100%)
            if (bitwindowDownload && (bitwindowDownload.status === 'downloading' || bitwindowDownload.status === 'extracting')) {
              // BitWindow is downloading - add 0-34% based on BitWindow's progress
              cumulativeProgress += (bitwindowDownload.progress / 100) * 34;
            } else if (bitwindowDownload) {
              // BitWindow is done
              cumulativeProgress = 100;
            }
          }
        }
        
        // Find or create BitWindow download entry
        let bitwindowIndex = updatedDownloads.findIndex(d => d.chainId === 'bitwindow');
        
        if (bitwindowIndex !== -1) {
          // Update existing BitWindow entry
          updatedDownloads[bitwindowIndex] = {
            ...updatedDownloads[bitwindowIndex],
            progress: Math.round(cumulativeProgress),
            // If any component is downloading, BitWindow should show as downloading
            status: anyComponentDownloading ? 'downloading' : updatedDownloads[bitwindowIndex].status
          };
        } else if (anyComponentDownloading) {
          // Create new BitWindow entry if it doesn't exist but components are downloading
          updatedDownloads.push({
            chainId: 'bitwindow',
            progress: Math.round(cumulativeProgress),
            status: 'downloading',
            displayName: 'BitWindow'
          });
        }
      }
      
      dispatch(updateDownloads(updatedDownloads));
      
      // Update chain statuses
      updatedDownloads.forEach(download => {
        dispatch(updateChainStatus({
          chainId: download.chainId,
          status: download.status,
          progress: download.progress
        }));
      });
      
      // If Bitcoin or Enforcer are downloading but BitWindow isn't in the downloads list,
      // explicitly update BitWindow's status to downloading
      if (anyComponentDownloading && !updatedDownloads.some(d => d.chainId === 'bitwindow')) {
        // Calculate progress based on the sequential download process
        let progress = 0;
        
        // Step 1: Bitcoin (0-33%)
        if (bitcoinDownload && (bitcoinDownload.status === 'downloading' || bitcoinDownload.status === 'extracting')) {
          // Bitcoin is downloading - progress is 0-33% based on Bitcoin's progress
          progress = (bitcoinDownload.progress / 100) * 33;
        } else {
          // Bitcoin is done - progress is at least 33%
          progress = 33;
          
          // Step 2: Enforcer (33-66%)
          if (enforcerDownload && (enforcerDownload.status === 'downloading' || enforcerDownload.status === 'extracting')) {
            // Enforcer is downloading - add 0-33% based on Enforcer's progress
            progress += (enforcerDownload.progress / 100) * 33;
          }
        }
        
        dispatch(updateChainStatus({
          chainId: 'bitwindow',
          status: 'downloading',
          progress: Math.round(progress)
        }));
      }
    },
    [dispatch]
  );

  const chainStatusUpdateHandler = useCallback(({ chainId, status }) => {
    dispatch(updateChainStatus({ chainId, status }));
    
    if (status === 'running' || status === 'ready') {
      setRunningNodes(prev => [...new Set([...prev, chainId])]);
    } else if (status === 'stopped' || status === 'not_downloaded') {
      setRunningNodes(prev => prev.filter(id => id !== chainId));
    }
  }, [dispatch]);

  const downloadCompleteHandler = useCallback(({ chainId }) => {
    console.log(`Download completed for chain: ${chainId}`);
    
    // Special handling for BitWindow and its dependencies
    if (chainId === 'bitwindow' || chainId === 'bitcoin' || chainId === 'enforcer') {
      // Check if all three components are downloaded
      const checkAllComponentsDownloaded = async () => {
        try {
          const bitcoinStatus = await window.electronAPI.getChainStatus('bitcoin');
          const enforcerStatus = await window.electronAPI.getChainStatus('enforcer');
          const bitwindowStatus = await window.electronAPI.getChainStatus('bitwindow');
          
          console.log(`Component statuses - Bitcoin: ${bitcoinStatus}, Enforcer: ${enforcerStatus}, BitWindow: ${bitwindowStatus}`);
          
          const allDownloaded = 
            (bitcoinStatus === 'downloaded' || bitcoinStatus === 'stopped' || bitcoinStatus === 'running' || bitcoinStatus === 'ready') &&
            (enforcerStatus === 'downloaded' || enforcerStatus === 'stopped' || enforcerStatus === 'running' || enforcerStatus === 'ready') &&
            (bitwindowStatus === 'downloaded' || bitwindowStatus === 'stopped' || bitwindowStatus === 'running' || bitwindowStatus === 'ready');
          
          if (allDownloaded) {
            console.log('All components downloaded, updating BitWindow status to downloaded');
            // Update BitWindow status to downloaded
            dispatch(updateChainStatus({ 
              chainId: 'bitwindow', 
              status: 'downloaded', 
              progress: 100 
            }));
          } else {
            console.log('Not all components downloaded yet, keeping BitWindow in downloading state');
            // If BitWindow download completed but not all components are ready,
            // keep it in a temporary state until all components are ready
            if (chainId === 'bitwindow') {
              dispatch(updateChainStatus({ 
                chainId: 'bitwindow', 
                status: 'downloading', 
                progress: 99 // Keep it at 99% to show it's almost done
              }));
            } else {
              // For Bitcoin and Enforcer, update their individual statuses
              dispatch(updateChainStatus({ 
                chainId, 
                status: 'downloaded', 
                progress: 100 
              }));
            }
          }
        } catch (error) {
          console.error('Error checking component statuses:', error);
          // Update the individual chain status as fallback
          dispatch(updateChainStatus({ 
            chainId, 
            status: 'downloaded', 
            progress: 100 
          }));
        }
      };
      
      checkAllComponentsDownloaded();
    } else {
      // For other chains, update status normally
      dispatch(updateChainStatus({ 
        chainId, 
        status: 'downloaded', 
        progress: 100 
      }));
    }
  }, [dispatch]);

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
    const unsubscribeBitcoinSync = window.electronAPI.onBitcoinSyncStatus(
      (status) => {
        setBitcoinSync(status);
        dispatch(updateIBDStatus({ chainId: 'bitcoin', status }));
      }
    );

    window.electronAPI.getDownloads().then(downloadsUpdateHandler);

    return () => {
      if (typeof unsubscribeDownloadsUpdate === 'function')
        unsubscribeDownloadsUpdate();
      if (typeof unsubscribeStatus === 'function') unsubscribeStatus();
      if (typeof unsubscribeDownloadComplete === 'function')
        unsubscribeDownloadComplete();
      if (typeof unsubscribeBitcoinSync === 'function')
        unsubscribeBitcoinSync();
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
    dispatch(updateChainStatus({ chainId, ...updates }));
  }, [dispatch]);

  // Helper function to wait for a download to complete
  const waitForDownloadComplete = useCallback(async (chainId) => {
    return new Promise((resolve) => {
      const checkStatus = async () => {
        try {
          const status = await window.electronAPI.getChainStatus(chainId);
          console.log(`Checking download status for ${chainId}: ${status}`);
          
          if (status === 'downloaded' || status === 'stopped' || status === 'running' || status === 'ready') {
            console.log(`Download completed for ${chainId}`);
            resolve(true);
            return;
          }
          
          // Check again after a delay
          setTimeout(checkStatus, 2000);
        } catch (error) {
          console.error(`Error checking download status for ${chainId}:`, error);
          // Continue checking despite error
          setTimeout(checkStatus, 2000);
        }
      };
      
      checkStatus();
    });
  }, []);

  const handleDownloadChain = useCallback(
    async chainId => {
      try {
        console.log(`Attempting to download chain ${chainId}`);
        
        // If BitWindow is being downloaded, download all three chains in sequence
        if (chainId === 'bitwindow') {
          // First check if Bitcoin and Enforcer are already downloaded
          const bitcoinStatus = await window.electronAPI.getChainStatus('bitcoin');
          const enforcerStatus = await window.electronAPI.getChainStatus('enforcer');
          
          console.log(`BitWindow download - Bitcoin status: ${bitcoinStatus}, Enforcer status: ${enforcerStatus}`);
          
          // Step 1: Download Bitcoin if needed
          if (bitcoinStatus === 'not_downloaded') {
            console.log('BitWindow depends on Bitcoin Core - downloading Bitcoin Core first');
            try {
              await window.electronAPI.downloadChain('bitcoin');
              console.log('Bitcoin download initiated successfully');
              
              // Wait for Bitcoin download to complete before proceeding
              console.log('Waiting for Bitcoin download to complete...');
              await waitForDownloadComplete('bitcoin');
            } catch (err) {
              console.error('Failed to initiate Bitcoin download:', err);
              throw err;
            }
          } else {
            console.log('Bitcoin already downloaded, skipping download');
          }
          
          // Step 2: Download Enforcer if needed (only after Bitcoin is done)
          if (enforcerStatus === 'not_downloaded') {
            console.log('BitWindow depends on Enforcer - downloading Enforcer');
            try {
              await window.electronAPI.downloadChain('enforcer');
              console.log('Enforcer download initiated successfully');
              
              // Wait for Enforcer download to complete before proceeding
              console.log('Waiting for Enforcer download to complete...');
              await waitForDownloadComplete('enforcer');
            } catch (err) {
              console.error('Failed to initiate Enforcer download:', err);
              throw err;
            }
          } else {
            console.log('Enforcer already downloaded, skipping download');
          }
          
          // Step 3: Finally download BitWindow (only after both Bitcoin and Enforcer are done)
          console.log('Starting BitWindow download');
          try {
            await window.electronAPI.downloadChain(chainId);
            console.log('BitWindow download initiated successfully');
          } catch (err) {
            console.error('Failed to initiate BitWindow download:', err);
            throw err;
          }
        } else {
          // For other chains, just download the requested chain
          await window.electronAPI.downloadChain(chainId);
          console.log(`Download initiated for chain ${chainId}`);
        }
        
        dispatch(showDownloadModal());
      } catch (error) {
        console.error(`Failed to start download for chain ${chainId}:`, error);
      }
    },
    [dispatch, waitForDownloadComplete]
  );

  const handleStartChain = useCallback(async chainId => {
    try {
      const chain = chains.find(c => c.id === chainId);
      if (!chain) {
        console.error(`Chain ${chainId} not found`);
        return;
      }

      if (chain.dependencies && chain.dependencies.length > 0) {
        const missingDeps = chain.dependencies.filter(dep => !runningNodes.includes(dep));
        if (missingDeps.length > 0) {
          console.error(`Cannot start ${chainId}: missing dependencies: ${missingDeps.join(', ')}`);
          return;
        }
      }

      await window.electronAPI.startChain(chainId);
      dispatch(updateChainStatus({ chainId, status: 'running' }));
    } catch (error) {
      console.error(`Failed to start chain ${chainId}:`, error);
    }
  }, [chains, runningNodes, dispatch]);

  const handleStopChain = useCallback(async chainId => {
    try {
      await window.electronAPI.stopChain(chainId);
      dispatch(updateChainStatus({ chainId, status: 'stopped' }));
    } catch (error) {
      console.error(`Failed to stop chain ${chainId}:`, error);
    }
  }, [dispatch]);

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

  if (isLoading && chains.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <h2>Loading Drivechain Launcher...</h2>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={showQuotes ? styles.containerWithQuotes : styles.container}>
      <div className={styles.chainSection}>
        <div className={styles.l1Chains}>
        {chains
          .filter(chain => chain.chain_type === 0)
          .map(chain => {
            // Comment out Bitcoin Core and Enforcer cards
            if (chain.id === 'bitcoin' || chain.id === 'enforcer') {
              return null; // Don't render these cards
            }
            
            return (
              chain.released === "no" ? (
                <UnreleasedCard
                  key={chain.id}
                  chain={chain}
                />
              ) : (
                <Card
                  key={chain.id}
                  chain={chain}
                  onUpdateChain={handleUpdateChain}
                  onDownload={handleDownloadChain}
                  onStart={handleStartChain}
                  onStop={handleStopChain}
                  onReset={handleResetChain}
                  onOpenWalletDir={handleOpenWalletDir}
                  runningNodes={runningNodes}
                />
              )
            );
          })}
        </div>
      </div>
      <div className={styles.chainSection}>
        <div className={styles.l2Chains}>
          {chains
            .filter(chain => chain.chain_type === 2)
            .map(chain => (
              <div key={chain.id}>
                {chain.released === "no" ? (
                  <UnreleasedCard chain={chain} />
                ) : (
                  <Card
                    chain={chain}
                    onUpdateChain={handleUpdateChain}
                    onDownload={handleDownloadChain}
                    onStart={handleStartChain}
                    onStop={handleStopChain}
                    onReset={handleResetChain}
                    onOpenWalletDir={handleOpenWalletDir}
                    runningNodes={runningNodes}
                  />
                )}
              </div>
            ))}
        </div>
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
