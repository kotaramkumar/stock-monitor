import React, { useState, useEffect } from 'react';
import { getQuote, getCompanyProfile } from '../services/finnhub';
import StockChart from './StockChart';
import styles from './StockDetail.module.css';

function StockDetail({ symbol, isInWatchlist, onAddToWatchlist, onRemoveFromWatchlist, onBack }) {
  const [quote, setQuote] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [q, p] = await Promise.all([
          getQuote(symbol),
          getCompanyProfile(symbol),
        ]);
        setQuote(q);
        setProfile(p);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.loading}>Loading {symbol}...</div>
      </div>
    );
  }

  const isPositive = quote?.change >= 0;
  const inList = isInWatchlist(symbol);

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={onBack}>← Back to Dashboard</button>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          {profile?.logo && (
            <img src={profile.logo} alt={symbol} className={styles.logo} />
          )}
          <div>
            <h2 className={styles.symbol}>{symbol}</h2>
            <p className={styles.name}>{profile?.name || symbol}</p>
          </div>
        </div>
        <button
          className={`${styles.watchlistBtn} ${inList ? styles.inList : ''}`}
          onClick={() => inList ? onRemoveFromWatchlist(symbol) : onAddToWatchlist(symbol)}
        >
          {inList ? '★ In Watchlist' : '☆ Add to Watchlist'}
        </button>
      </div>

      {quote && (
        <div className={styles.quoteSection}>
          <div className={styles.price}>${quote.currentPrice?.toFixed(2)}</div>
          <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
            {isPositive ? '+' : ''}{quote.change?.toFixed(2)} ({isPositive ? '+' : ''}{quote.percentChange?.toFixed(2)}%)
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Open</span>
              <span className={styles.statValue}>${quote.openPrice?.toFixed(2)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>High</span>
              <span className={styles.statValue}>${quote.highPrice?.toFixed(2)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Low</span>
              <span className={styles.statValue}>${quote.lowPrice?.toFixed(2)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Prev Close</span>
              <span className={styles.statValue}>${quote.previousClose?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <StockChart symbol={symbol} />

      {profile && (profile.finnhubIndustry || profile.country) && (
        <div className={styles.profileSection}>
          <h3 className={styles.profileTitle}>{profile.finnhubIndustry ? 'Company Info' : 'Fund Info'}</h3>
          <div className={styles.profileGrid}>
            {profile.finnhubIndustry && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>Industry</span>
                <span className={styles.profileValue}>{profile.finnhubIndustry}</span>
              </div>
            )}
            {profile.country && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>Country</span>
                <span className={styles.profileValue}>{profile.country}</span>
              </div>
            )}
            {profile.exchange && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>Exchange</span>
                <span className={styles.profileValue}>{profile.exchange}</span>
              </div>
            )}
            {profile.marketCapitalization && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>Market Cap</span>
                <span className={styles.profileValue}>
                  ${(profile.marketCapitalization / 1000).toFixed(1)}B
                </span>
              </div>
            )}
            {profile.weburl && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>Website</span>
                <a
                  href={profile.weburl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {profile.weburl.replace(/https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StockDetail;
