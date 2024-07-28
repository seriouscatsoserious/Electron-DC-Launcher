import React from 'react';
import { BrowserRouter as Router, Route, NavLink, Routes } from 'react-router-dom';
import './App.css';
import Nodes from './components/Nodes';
import Wallet from './components/Wallet';
import Tools from './components/Tools';
import Settings from './components/Settings';
import Other from './components/Other';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function AppContent() {
  const { isDarkMode } = useTheme();

  return (
    <Router>
      <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
      <nav>
  <ul>
    <li><NavLink to="/" end>Nodes</NavLink></li>
    <li><NavLink to="/wallet">Wallet</NavLink></li>
    <li><NavLink to="/tools">Tools</NavLink></li>
    <li><NavLink to="/settings">Settings</NavLink></li>
    <li><NavLink to="/other">Other</NavLink></li>
  </ul>
  <ThemeToggle />
</nav>

        <Routes>
          <Route path="/" element={<Nodes />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/other" element={<Other />} />
        </Routes>
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