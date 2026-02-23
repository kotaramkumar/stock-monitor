import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useStockData } from '../hooks/useStockData';
import { getMultipleMetrics } from '../services/finnhub';
import StockCard from './StockCard';
import colors from '../theme/colors';

const STOCKS = ['SOFI', 'NIO', 'PLTR', 'SNAP', 'RIVN', 'LCID', 'AMC', 'SNDL', 'F', 'BAC', 'VALE', 'ITUB', 'AAL', 'CCL', 'PLUG'];
const ETFS = ['SQQQ', 'TQQQ', 'UVXY', 'SOXS', 'LABU', 'SPXS'];
const BEST_PRICE = ['SOFI', 'NIO', 'RIVN', 'LCID', 'AMC', 'SNDL', 'PLUG', 'AAL', 'CCL', 'VALE', 'ITUB', 'F', 'SNAP', 'WISH', 'CLOV'];

// High-volume stocks screened for potential undervaluation (low P/E, low P/B, near 52-week lows)
const UNDERVALUED_CANDIDATES = [
  'INTC', 'T', 'WBA', 'PARA', 'F', 'BAC', 'C', 'VALE', 'PBR',
  'AAL', 'CCL', 'KEY', 'USB', 'GM', 'VZ', 'OXY', 'MRO', 'NIO', 'SOFI', 'SNAP',
];

// Composite undervalue score: rewards high volume, low P/E, low P/B, proximity to 52-week low
function calcUndervalueScore(quote, metrics) {
  if (!quote || !metrics) return 0;
  let score = 0;

  // Volume (log-scaled, capped at 10 pts)
  if (quote.volume) score += Math.min(Math.log10(quote.volume + 1) * 2, 10);

  // P/E: positive and below 25 is attractive
  if (metrics.pe > 0) score += Math.max(0, (25 - metrics.pe) / 5);

  // P/B: below 3 is attractive; below 1 is deeply undervalued
  if (metrics.pb > 0 && metrics.pb < 3) score += Math.max(0, (3 - metrics.pb) * 2);

  // Proximity to 52-week low: within 30% of low gets bonus points
  if (metrics.week52Low && metrics.week52High && quote.currentPrice) {
    const range = metrics.week52High - metrics.week52Low;
    if (range > 0) {
      const fromLow = (quote.currentPrice - metrics.week52Low) / range;
      score += Math.max(0, (0.5 - fromLow) * 6);
    }
  }

  return score;
}

const TABS = [
  { key: 'stocks',      label: 'Stocks' },
  { key: 'etfs',        label: 'ETFs' },
  { key: 'bestprice',   label: 'Best Price' },
  { key: 'undervalued', label: 'Undervalued' },
];

export default function HighVolumeStocks({ onSelectStock }) {
  const [activeTab, setActiveTab] = useState('stocks');
  const [metrics, setMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const metricsFetched = useRef(false);

  const allSymbols = [...new Set([...STOCKS, ...ETFS, ...BEST_PRICE, ...UNDERVALUED_CANDIDATES])];
  const { quotes } = useStockData(allSymbols);

  useEffect(() => {
    if (activeTab === 'undervalued' && !metricsFetched.current) {
      metricsFetched.current = true;
      setMetricsLoading(true);
      getMultipleMetrics(UNDERVALUED_CANDIDATES)
        .then(setMetrics)
        .finally(() => setMetricsLoading(false));
    }
  }, [activeTab]);

  let displaySymbols;
  if (activeTab === 'stocks') {
    const loaded = STOCKS
      .filter(s => quotes[s])
      .sort((a, b) => (quotes[b].volume || 0) - (quotes[a].volume || 0));
    displaySymbols = [...loaded, ...STOCKS.filter(s => !quotes[s])];
  } else if (activeTab === 'etfs') {
    displaySymbols = ETFS;
  } else if (activeTab === 'bestprice') {
    displaySymbols = BEST_PRICE
      .filter(s => quotes[s] && quotes[s].currentPrice < 50)
      .sort((a, b) => quotes[a].currentPrice - quotes[b].currentPrice);
  } else {
    const scored = UNDERVALUED_CANDIDATES
      .filter(s => quotes[s])
      .sort((a, b) =>
        calcUndervalueScore(quotes[b], metrics[b]) -
        calcUndervalueScore(quotes[a], metrics[a])
      );
    displaySymbols = [...scored, ...UNDERVALUED_CANDIDATES.filter(s => !quotes[s])];
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>High Volume, Low Price</Text>
      <View style={s.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, activeTab === tab.key && s.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'undervalued' && metricsLoading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator color={colors.accent} />
          <Text style={s.loadingText}>Fetching valuation metrics…</Text>
        </View>
      ) : (
        <FlatList
          data={displaySymbols}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <StockCard
              symbol={item}
              quote={quotes[item]}
              metrics={activeTab === 'undervalued' ? metrics[item] : undefined}
              onPress={onSelectStock}
            />
          )}
          numColumns={2}
          columnWrapperStyle={s.row}
          scrollEnabled={false}
          contentContainerStyle={s.grid}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 20, paddingHorizontal: 16 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.secondaryText, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  row: { justifyContent: 'space-between' },
  grid: { gap: 0 },
  loadingBox: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  loadingText: { color: colors.secondaryText, fontSize: 13 },
});
