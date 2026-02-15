import React from 'react';
import { useStockData } from '../hooks/useStockData';
import Sparkline from './Sparkline';
import styles from './MarketOverview.module.css';

const INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'NASDAQ' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'IWM', name: 'Russell 2000' },
];

function MarketOverview() {
  const symbols = INDICES.map((i) => i.symbol);
  const { quotes } = useStockData(symbols);

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Market Overview</h3>
      <div className={styles.grid}>
        {INDICES.map(({ symbol, name }) => {
          const q = quotes[symbol];
          const isPositive = q?.change >= 0;
          return (
            <div key={symbol} className={styles.card}>
              <div className={styles.name}>{name}</div>
              <div className={styles.price}>
                {q ? `$${q.currentPrice?.toFixed(2)}` : '—'}
              </div>
              {q && (
                <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                  {isPositive ? '+' : ''}{q.percentChange?.toFixed(2)}%
                </div>
              )}
              <div className={styles.chartArea}>
                <Sparkline symbol={symbol} quote={q} height={40} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MarketOverview;
