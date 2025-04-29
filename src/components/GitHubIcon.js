import React from 'react';
import { MarkGithubIcon } from '@primer/octicons-react';
import styles from './GitHubIcon.module.css';

const GitHubIcon = () => {
  return (
    <div className={styles.icon}>
      <MarkGithubIcon size={20} fill="currentColor" />
    </div>
  );
};

export default GitHubIcon;
