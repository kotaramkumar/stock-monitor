import React, { useState } from 'react';
import { useStockData } from '../hooks/useStockData';
import StockCard from './StockCard';
import styles from './HighVolumeStocks.module.css';

const STOCKS = ['SOFI', 'NIO', 'PLTR', 'SNAP', 'RIVN', 'LCID', 'AMC', 'SNDL'];
const ETFS = ['SQQQ', 'TQQQ', 'UVXY', 'SOXS', 'LABU', 'SPXS'];

function HighVolumeStocks({ onSelectStock }) {
  const [activeTab, setActiveTab] = useState('stocks');
  const visibleSymbols = activeTab === 'stocks' ? STOCKS : ETFS;
  const { quotes } = useStockData(visibleSymbols);

  return (
    <div className={styles.container}>
      <div className={styles.headingRow}>
        <h3 className={styles.heading}>High Volume, Low Price</h3>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'stocks' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('stocks')}
          >
            Stocks
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'etfs' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('etfs')}
          >
            ETFs
          </button>
        </div>
      </div>
      <div className={styles.grid}>
        {visibleSymbols.map((symbol) => (
          <StockCard
            key={symbol}
            symbol={symbol}
            quote={quotes[symbol]}
            onClick={onSelectStock}
          />
        ))}
      </div>
    </div>
  );
}

export default HighVolumeStocks;
