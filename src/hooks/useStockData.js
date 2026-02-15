import { useState, useEffect, useCallback, useRef } from 'react';
import { getMultipleQuotes } from '../services/finnhub';

const REFRESH_INTERVAL = 30000; // 30 seconds

export function useStockData(symbols) {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const symbolsKey = symbols.join(',');

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getMultipleQuotes(symbols);
      setQuotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbolsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchQuotes();

    intervalRef.current = setInterval(fetchQuotes, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchQuotes]);

  return { quotes, loading, error, refresh: fetchQuotes };
}
