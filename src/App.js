import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './scrollbar.css';
import NavBar from './components/NavBar';
import Nodes from './components/Nodes';
import Wallet from './components/Wallet';
// import Tools from './components/Tools';
import Settings from './components/Settings';
import Other from './components/Other';
import FaucetModal from './components/FaucetModal';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import CUSF from './components/CUSF';

function AppContent() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<Nodes />} />
          <Route path="/wallet" element={<Wallet />} />
          {/* <Route path="/tools" element={<Tools />} /> */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/other" element={<Other />} />
          <Route path="/cusf" element={<CUSF />} />
        </Routes>
        <FaucetModal />
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
