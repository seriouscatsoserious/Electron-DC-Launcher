import React from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import styles from './NavBar.module.css';

const NavBar = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li><NavLink to="/" end className={styles.navLink}>Nodes</NavLink></li>
        <li><NavLink to="/wallet" className={styles.navLink}>Wallet</NavLink></li>
        <li><NavLink to="/tools" className={styles.navLink}>Tools</NavLink></li>
        <li><NavLink to="/settings" className={styles.navLink}>Settings</NavLink></li>
        <li><NavLink to="/other" className={styles.navLink}>Other</NavLink></li>
      </ul>
      <ThemeToggle />
    </nav>
  );
};

export default NavBar;