const API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

async function fetchAPI(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('token', API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. Please wait a moment.');
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function getQuote(symbol) {
  const data = await fetchAPI('/quote', { symbol });
  return {
    currentPrice: data.c,
    change: data.d,
    percentChange: data.dp,
    highPrice: data.h,
    lowPrice: data.l,
    openPrice: data.o,
    previousClose: data.pc,
    timestamp: data.t,
  };
}

export async function searchSymbol(query) {
  const data = await fetchAPI('/search', { q: query });
  return (data.result || []).filter(
    (item) => item.type === 'Common Stock' && !item.symbol.includes('.')
  );
}

export async function getCompanyProfile(symbol) {
  return fetchAPI('/stock/profile2', { symbol });
}

// Build chart data from the current quote's intraday points (open, low, high, close)
// and persist historical closing prices in localStorage for multi-day charts
const HISTORY_KEY = 'stock-monitor-price-history';

function loadPriceHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
  } catch {
    return {};
  }
}

function savePriceHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function recordQuoteHistory(symbol, quote) {
  if (!quote || !quote.currentPrice) return;
  const history = loadPriceHistory();
  if (!history[symbol]) history[symbol] = [];

  const today = new Date().toISOString().slice(0, 10);
  const existing = history[symbol].find((p) => p.date === today);
  if (existing) {
    existing.close = quote.currentPrice;
    existing.high = Math.max(existing.high, quote.highPrice || quote.currentPrice);
    existing.low = Math.min(existing.low, quote.lowPrice || quote.currentPrice);
  } else {
    history[symbol].push({
      date: today,
      open: quote.openPrice || quote.currentPrice,
      high: quote.highPrice || quote.currentPrice,
      low: quote.lowPrice || quote.currentPrice,
      close: quote.currentPrice,
    });
  }

  // Keep last 365 days
  history[symbol] = history[symbol].slice(-365);
  savePriceHistory(history);
}

export function getChartData(symbol, quote) {
  // Build intraday points from current quote
  const intradayPoints = [];
  if (quote) {
    const now = Date.now();
    const marketOpen = new Date();
    marketOpen.setHours(9, 30, 0, 0);
    const openTime = marketOpen.getTime();

    if (quote.previousClose) {
      intradayPoints.push({ time: openTime - 60000, close: quote.previousClose });
    }
    if (quote.openPrice) {
      intradayPoints.push({ time: openTime, close: quote.openPrice });
    }
    if (quote.lowPrice && quote.lowPrice !== quote.openPrice) {
      intradayPoints.push({ time: openTime + (now - openTime) * 0.3, close: quote.lowPrice });
    }
    if (quote.highPrice && quote.highPrice !== quote.lowPrice) {
      intradayPoints.push({ time: openTime + (now - openTime) * 0.6, close: quote.highPrice });
    }
    if (quote.currentPrice) {
      intradayPoints.push({ time: now, close: quote.currentPrice });
    }
  }

  // Load historical data
  const history = loadPriceHistory();
  const historicalPoints = (history[symbol] || []).map((p) => ({
    time: new Date(p.date).getTime(),
    close: p.close,
    open: p.open,
    high: p.high,
    low: p.low,
  }));

  return { intradayPoints, historicalPoints };
}

export async function getMultipleQuotes(symbols) {
  const results = {};
  const batchSize = 5;

  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const promises = batch.map(async (symbol) => {
      try {
        const quote = await getQuote(symbol);
        results[symbol] = quote;
      } catch {
        results[symbol] = null;
      }
    });
    await Promise.all(promises);

    if (i + batchSize < symbols.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
