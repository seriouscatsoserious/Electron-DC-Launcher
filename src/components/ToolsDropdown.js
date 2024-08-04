import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useDispatch } from 'react-redux';
import { showFaucetModal } from '../store/faucetSlice';
import navStyles from './NavBar.module.css';
import styles from './ToolsDropdown.module.css';

const ToolsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const dropdownRef = useRef(null);
  const linkRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = e => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleOptionClick = option => {
    console.log(`Selected option: ${option}`);
    setIsOpen(false);
    if (option === 'Faucet') {
      dispatch(showFaucetModal());
    }
    // Implement other options here
  };

  useEffect(() => {
    if (isOpen && linkRef.current && dropdownRef.current) {
      const linkRect = linkRef.current.getBoundingClientRect();
      dropdownRef.current.style.left = `${linkRect.left}px`;
    }
  }, [isOpen]);

  return (
    <div className={`${styles.dropdown} ${isDarkMode ? 'dark' : 'light'}`}>
      <NavLink
        to="/tools"
        ref={linkRef}
        className={({ isActive }) =>
          `${navStyles.navLink} ${isActive ? navStyles.active : ''} ${styles.dropdownToggle}`
        }
        onClick={toggleDropdown}
      >
        Tools
      </NavLink>
      {isOpen && (
        <ul
          ref={dropdownRef}
          className={`${styles.dropdownMenu} ${isOpen ? styles.fadeIn : styles.fadeOut}`}
        >
          <li onClick={() => handleOptionClick('Faucet')}>Faucet</li>
          {/* ... (keep other options) */}
        </ul>
      )}
    </div>
  );
};

export default ToolsDropdown;
