import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useStockData } from '../hooks/useStockData';
import { getMultipleMetrics } from '../services/finnhub';
import StockCard from './StockCard';
import colors from '../theme/colors';

// Combined pool: high-volume stocks + ETFs
const ALL_SYMBOLS = [
  // Stocks — high volume, range of prices
  'SOFI', 'NIO', 'PLTR', 'SNAP', 'RIVN', 'LCID', 'AMC', 'F', 'BAC',
  'VALE', 'ITUB', 'AAL', 'CCL', 'PLUG', 'INTC', 'T', 'WBA', 'PARA',
  'C', 'PBR', 'KEY', 'GM', 'VZ', 'OXY', 'MRO',
  // ETFs — high volume
  'SQQQ', 'TQQQ', 'UVXY', 'SOXS', 'LABU', 'SPXS',
];

// Score: high volume + low P/E + low P/B + near 52-week low = undervalued
function calcUndervalueScore(quote, metrics) {
  if (!quote) return 0;
  let score = 0;

  if (quote.volume) score += Math.min(Math.log10(quote.volume + 1) * 2, 10);

  if (metrics) {
    if (metrics.pe > 0) score += Math.max(0, (25 - metrics.pe) / 5);
    if (metrics.pb > 0 && metrics.pb < 3) score += Math.max(0, (3 - metrics.pb) * 2);
    if (metrics.week52Low && metrics.week52High && quote.currentPrice) {
      const range = metrics.week52High - metrics.week52Low;
      if (range > 0) {
        const fromLow = (quote.currentPrice - metrics.week52Low) / range;
        score += Math.max(0, (0.5 - fromLow) * 6);
      }
    }
  }

  return score;
}

const TABS = [
  { key: 'highvolume',  label: 'High Volume' },
  { key: 'undervalued', label: 'Undervalued & Best' },
];

export default function HighVolumeStocks({ onSelectStock }) {
  const [activeTab, setActiveTab] = useState('highvolume');
  const [metrics, setMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const metricsFetched = useRef(false);

  const { quotes } = useStockData(ALL_SYMBOLS);

  useEffect(() => {
    if (activeTab === 'undervalued' && !metricsFetched.current) {
      metricsFetched.current = true;
      setMetricsLoading(true);
      getMultipleMetrics(ALL_SYMBOLS)
        .then(setMetrics)
        .finally(() => setMetricsLoading(false));
    }
  }, [activeTab]);

  let displaySymbols;
  if (activeTab === 'highvolume') {
    const loaded = ALL_SYMBOLS
      .filter(s => quotes[s])
      .sort((a, b) => (quotes[b].volume || 0) - (quotes[a].volume || 0));
    displaySymbols = [...loaded, ...ALL_SYMBOLS.filter(s => !quotes[s])];
  } else {
    const scored = ALL_SYMBOLS
      .filter(s => quotes[s])
      .sort((a, b) =>
        calcUndervalueScore(quotes[b], metrics[b]) -
        calcUndervalueScore(quotes[a], metrics[a])
      );
    displaySymbols = [...scored, ...ALL_SYMBOLS.filter(s => !quotes[s])];
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>High Volume Stocks & ETFs</Text>
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
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.secondaryText, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  row: { justifyContent: 'space-between' },
  grid: { gap: 0 },
  loadingBox: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  loadingText: { color: colors.secondaryText, fontSize: 13 },
});
