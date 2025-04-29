import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useDispatch } from 'react-redux';
import { showWalletModal } from '../store/walletModalSlice';
import { showFastWithdrawalModal } from '../store/fastWithdrawalModalSlice';
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
    switch (option) {
      case 'Fast Withdrawal':
        dispatch(showFastWithdrawalModal());
        break;
      case 'Wallet':
        dispatch(showWalletModal());
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isOpen && linkRef.current && dropdownRef.current) {
      const linkRect = linkRef.current.getBoundingClientRect();
      dropdownRef.current.style.right = `${window.innerWidth - linkRect.right}px`;
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
          <li onClick={() => handleOptionClick('Wallet')}>Wallet</li>
          <li onClick={() => handleOptionClick('Fast Withdrawal')}>Fast Withdrawal</li>
        </ul>
      )}
    </div>
  );
};

export default ToolsDropdown;
