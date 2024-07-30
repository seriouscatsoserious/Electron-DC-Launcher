import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`${styles.iconWrapper} ${styles.themeToggle}`}
      id="theme-toggle-button"
    >
      {isDarkMode ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
    </button>
  );
};

export default ThemeToggle;
