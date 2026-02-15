import React, { useState, useRef, useEffect } from 'react';
import { searchSymbol } from '../services/finnhub';
import StockCard from './StockCard';
import styles from './Watchlist.module.css';

function Watchlist({ watchlist, quotes, onSelectStock, onRemoveSymbol, onAddSymbol }) {
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAdd(false);
        setQuery('');
        setResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(e) {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 1) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchSymbol(value.trim());
        setResults(data.slice(0, 6));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }

  function handleAdd(symbol) {
    onAddSymbol(symbol);
    setQuery('');
    setResults([]);
    setShowAdd(false);
  }

  // Sort by percent change to show gainers/losers
  const sorted = [...watchlist].sort((a, b) => {
    const aChange = quotes[a]?.percentChange ?? 0;
    const bChange = quotes[b]?.percentChange ?? 0;
    return bChange - aChange;
  });

  const withQuotes = sorted.filter((s) => quotes[s]?.percentChange != null);
  const gainers = withQuotes.filter((s) => quotes[s].percentChange >= 0).slice(0, 3);
  const losers = withQuotes.filter((s) => quotes[s].percentChange < 0).slice(0, 3);

  return (
    <div className={styles.container}>
      {gainers.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.gainIcon}>▲</span> Top Gainers
          </h3>
          <div className={styles.miniList}>
            {gainers.map((symbol) => (
              <div key={symbol} className={styles.miniItem} onClick={() => onSelectStock(symbol)}>
                <span className={styles.miniSymbol}>{symbol}</span>
                <span className={styles.gainText}>+{quotes[symbol].percentChange.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {losers.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.loseIcon}>▼</span> Top Losers
          </h3>
          <div className={styles.miniList}>
            {losers.map((symbol) => (
              <div key={symbol} className={styles.miniItem} onClick={() => onSelectStock(symbol)}>
                <span className={styles.miniSymbol}>{symbol}</span>
                <span className={styles.loseText}>{quotes[symbol].percentChange.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.headingRow}>
        <h3 className={styles.heading}>Watchlist ({watchlist.length})</h3>
        <div className={styles.addContainer} ref={dropdownRef}>
          {showAdd ? (
            <div className={styles.addForm}>
              <input
                type="text"
                className={styles.addInput}
                placeholder="Search symbol or name..."
                value={query}
                onChange={handleSearch}
                autoFocus
              />
              {searching && <span className={styles.searchingText}>Searching...</span>}
              {results.length > 0 && (
                <ul className={styles.addDropdown}>
                  {results.map((item) => (
                    <li
                      key={item.symbol}
                      className={styles.addItem}
                      onClick={() => handleAdd(item.symbol)}
                    >
                      <span className={styles.addSymbol}>{item.symbol}</span>
                      <span className={styles.addDesc}>{item.description}</span>
                      {watchlist.includes(item.symbol) ? (
                        <span className={styles.alreadyAdded}>Added</span>
                      ) : (
                        <span className={styles.addBtn}>+ Add</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <button className={styles.addStockBtn} onClick={() => setShowAdd(true)}>
              + Add Stock
            </button>
          )}
        </div>
      </div>
      <div className={styles.grid}>
        {watchlist.map((symbol) => (
          <StockCard
            key={symbol}
            symbol={symbol}
            quote={quotes[symbol]}
            onClick={onSelectStock}
            onRemove={onRemoveSymbol}
          />
        ))}
      </div>
      {watchlist.length === 0 && (
        <p className={styles.empty}>
          Your watchlist is empty. Search for stocks to add them.
        </p>
      )}
    </div>
  );
}

export default Watchlist;
