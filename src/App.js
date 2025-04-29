import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './App.css';
import './scrollbar.css';
import NavBar from './components/NavBar';
import cardData from './CardData.json';
import Nodes from './components/Nodes';
import Settings from './components/Settings';
import Other from './components/Other';
import FaucetModal from './components/FaucetModal';
import WalletModal from './components/WalletModal';
import FastWithdrawalModal from './components/FastWithdrawalModal';
import SettingsModal from './components/SettingsModal';
import WelcomeModal from './components/WelcomeModal';
import QuoteWidget from './components/QuoteWidget';
import ShutdownModal from './components/ShutdownModal';
import DownloadInProgressModal from './components/DownloadInProgressModal';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppContent() {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeDownloads, setActiveDownloads] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Make cardData globally available
  useEffect(() => {
    window.cardData = cardData;
  }, []);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  // Listen for downloads-in-progress event
  useEffect(() => {
    const unsubscribe = window.electronAPI.onDownloadsInProgress((downloads) => {
      setActiveDownloads(downloads);
      setShowDownloadModal(true);
    });
    return () => unsubscribe();
  }, []);

  const handleForceQuit = () => {
    window.electronAPI.forceQuitWithDownloads();
  };

  // Check for updates and master wallet on startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const result = await window.electronAPI.getMasterWallet();
        if (!result.success || !result.data) {
          setShowWelcomeModal(true);
        }
      } catch (error) {
        console.error('Error checking master wallet:', error);
        setShowWelcomeModal(true);
      } finally {
        setIsInitialized(true);
        // Signal that app is fully initialized
        window.electronAPI.notifyReady();
      }
    };

    initializeApp();
  }, [dispatch]);

  if (!isInitialized) {
    return null; // Show nothing until initialization is complete
  }

  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/chains" replace />} />
          <Route path="/chains" element={<Nodes />} />
          <Route path="/wallet" element={<WalletModal />} />
          <Route path="/fast-withdrawal" element={<FastWithdrawalModal />} />
        </Routes>
        <FaucetModal />
        <SettingsModal onResetComplete={() => setShowWelcomeModal(true)} />
        <WelcomeModal 
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
        />
        <QuoteWidget />
        <ShutdownModal />
        <DownloadInProgressModal
          downloads={activeDownloads}
          onClose={() => setShowDownloadModal(false)}
          onForceQuit={handleForceQuit}
          isOpen={showDownloadModal}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
