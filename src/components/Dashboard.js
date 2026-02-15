import React from 'react';
import MarketOverview from './MarketOverview';
import Watchlist from './Watchlist';
import styles from './Dashboard.module.css';

function Dashboard({ watchlist, quotes, onSelectStock, onRemoveSymbol, onAddSymbol }) {
  return (
    <div className={styles.dashboard}>
      <MarketOverview />
      <Watchlist
        watchlist={watchlist}
        quotes={quotes}
        onSelectStock={onSelectStock}
        onRemoveSymbol={onRemoveSymbol}
        onAddSymbol={onAddSymbol}
      />
    </div>
  );
}

export default Dashboard;
