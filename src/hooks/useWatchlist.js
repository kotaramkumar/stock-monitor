import { useState, useCallback } from 'react';

const STORAGE_KEY = 'stock-monitor-watchlist';
const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

function loadWatchlist() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_WATCHLIST;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(loadWatchlist);

  const saveWatchlist = useCallback((list) => {
    setWatchlist(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, []);

  const addSymbol = useCallback(
    (symbol) => {
      const upper = symbol.toUpperCase();
      setWatchlist((prev) => {
        if (prev.includes(upper)) return prev;
        const next = [...prev, upper];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeSymbol = useCallback(
    (symbol) => {
      const upper = symbol.toUpperCase();
      setWatchlist((prev) => {
        const next = prev.filter((s) => s !== upper);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const isInWatchlist = useCallback(
    (symbol) => watchlist.includes(symbol.toUpperCase()),
    [watchlist]
  );

  return { watchlist, addSymbol, removeSymbol, isInWatchlist, saveWatchlist };
}
