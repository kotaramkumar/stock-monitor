import React from 'react';
import SearchBar from './SearchBar';
import styles from './Header.module.css';

function Header({ onSelectStock, onGoHome }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand} onClick={onGoHome}>
        <span className={styles.logo}>$</span>
        <h1 className={styles.title}>StockMonitor</h1>
      </div>
      <SearchBar onSelectStock={onSelectStock} />
    </header>
  );
}

export default Header;
