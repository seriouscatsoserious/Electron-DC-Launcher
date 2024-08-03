import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import navStyles from './NavBar.module.css';
import styles from './ToolsDropdown.module.css';

const ToolsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const dropdownRef = useRef(null);
  const linkRef = useRef(null);

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
    // Implement the functionality for each option here
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
          <li onClick={() => handleOptionClick('Option 1')}>Option 1</li>
          <li onClick={() => handleOptionClick('Option 2')}>Option 2</li>
          <li onClick={() => handleOptionClick('Option 3')}>Option 3</li>
        </ul>
      )}
    </div>
  );
};

export default ToolsDropdown;
