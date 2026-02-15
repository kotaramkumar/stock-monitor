import React, { useState, useEffect, useRef } from 'react';
import { searchSymbol } from '../services/finnhub';
import styles from './SearchBar.module.css';

function SearchBar({ onSelectStock }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchSymbol(value.trim());
        setResults(data.slice(0, 8));
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  function handleSelect(symbol) {
    onSelectStock(symbol);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        type="text"
        className={styles.input}
        placeholder="Search stocks (e.g. AAPL, Tesla)..."
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setIsOpen(true)}
      />
      {loading && <span className={styles.spinner} />}
      {isOpen && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((item) => (
            <li
              key={item.symbol}
              className={styles.item}
              onClick={() => handleSelect(item.symbol)}
            >
              <span className={styles.symbol}>{item.symbol}</span>
              <span className={styles.description}>{item.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
