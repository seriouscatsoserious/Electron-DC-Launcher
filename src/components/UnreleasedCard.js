import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './UnreleasedCard.module.css';

const UnreleasedCard = ({ chain }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`${styles.card} ${isDarkMode ? 'dark' : 'light'}`}>
      <div className={styles.content}>
        <p className={styles.description}>
          {chain.display_name} is in development, contribute here:
        </p>
        <a
          href={chain.repo_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          {chain.repo_url}
        </a>
      </div>
    </div>
  );
};

export default UnreleasedCard;
