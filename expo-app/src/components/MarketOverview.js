import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useStockData } from '../hooks/useStockData';
import Sparkline from './Sparkline';
import colors from '../theme/colors';

const INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'NASDAQ' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'IWM', name: 'Russell 2000' },
];

export default function MarketOverview() {
  const symbols = INDICES.map((i) => i.symbol);
  const { quotes } = useStockData(symbols);

  const renderItem = ({ item }) => {
    const q = quotes[item.symbol];
    const isPositive = q?.change >= 0;
    return (
      <View style={s.card}>
        <Text style={s.name}>{item.name}</Text>
        <Text style={s.price}>{q ? `$${q.currentPrice?.toFixed(2)}` : '...'}</Text>
        {q && (
          <Text style={[s.change, isPositive ? s.positive : s.negative]}>
            {isPositive ? '+' : ''}{q.percentChange?.toFixed(2)}%
          </Text>
        )}
        <View style={s.chartArea}>
          <Sparkline quote={q} height={55} width={140} />
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <Text style={s.heading}>Market Overview</Text>
      <FlatList
        data={INDICES}
        keyExtractor={(item) => item.symbol}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 20 },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginLeft: 12,
    width: 165,
  },
  name: { color: colors.secondaryText, fontSize: 12, marginBottom: 4 },
  price: { color: colors.text, fontSize: 17, fontWeight: '600', marginBottom: 2 },
  change: { fontSize: 13, fontWeight: '600' },
  positive: { color: colors.green },
  negative: { color: colors.red },
  chartArea: { marginTop: 4 },
});
