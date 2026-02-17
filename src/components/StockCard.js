import React from 'react';
import Sparkline from './Sparkline';
import styles from './StockCard.module.css';

function StockCard({ symbol, quote, onClick, onRemove }) {
  if (!quote) {
    return (
      <div className={styles.card} onClick={() => onClick && onClick(symbol)}>
        <div className={styles.symbolRow}>
          <span className={styles.symbol}>{symbol}</span>
          {onRemove && (
            <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); onRemove(symbol); }}>
              ×
            </button>
          )}
        </div>
        <span className={styles.loading}>Loading...</span>
      </div>
    );
  }

  const isPositive = quote.change >= 0;
  const changeClass = isPositive ? styles.positive : styles.negative;

  return (
    <div className={styles.card} onClick={() => onClick && onClick(symbol)}>
      <div className={styles.symbolRow}>
        <span className={styles.symbol}>{symbol}</span>
        {onRemove && (
          <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); onRemove(symbol); }}>
            ×
          </button>
        )}
      </div>
      <div className={styles.price}>${quote.currentPrice?.toFixed(2)}</div>
      <div className={`${styles.change} ${changeClass}`}>
        <span>{isPositive ? '+' : ''}{quote.change?.toFixed(2)}</span>
        <span>({isPositive ? '+' : ''}{quote.percentChange?.toFixed(2)}%)</span>
      </div>
      <div className={styles.chartArea}>
        <Sparkline symbol={symbol} quote={quote} height={45} />
      </div>
    </div>
  );
}

export default StockCard;
