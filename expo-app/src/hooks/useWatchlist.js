import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'stock-monitor-watchlist';
const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setWatchlist(JSON.parse(stored));
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((list) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, []);

  const addSymbol = useCallback((symbol) => {
    const upper = symbol.toUpperCase();
    setWatchlist((prev) => {
      if (prev.includes(upper)) return prev;
      const next = [...prev, upper];
      persist(next);
      return next;
    });
  }, [persist]);

  const removeSymbol = useCallback((symbol) => {
    const upper = symbol.toUpperCase();
    setWatchlist((prev) => {
      const next = prev.filter((s) => s !== upper);
      persist(next);
      return next;
    });
  }, [persist]);

  const isInWatchlist = useCallback(
    (symbol) => watchlist.includes(symbol.toUpperCase()),
    [watchlist]
  );

  return { watchlist, addSymbol, removeSymbol, isInWatchlist, loaded };
}
