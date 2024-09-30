import React from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import DownloadIcon from './DownloadIcon';
import ToolsDropdown from './ToolsDropdown';
import styles from './NavBar.module.css';

const NavBar = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            Nodes
          </NavLink>
        </li>        
        <li>
          <NavLink
            to="/cusf"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            CUSF
          </NavLink>
        </li>
        {/* <li>
          <NavLink
            to="/wallet"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            Wallet
          </NavLink>
        </li> */}
        <li>
          <ToolsDropdown />
        </li>

        {/* <li>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            Settings
          </NavLink>
        </li> */}
        {/* <li>
          <NavLink
            to="/other"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            Other
          </NavLink>
        </li> */}
      </ul>
      <div className={styles.iconContainer}>
        <DownloadIcon />
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default NavBar;
