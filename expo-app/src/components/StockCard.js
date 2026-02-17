import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Sparkline from './Sparkline';
import colors from '../theme/colors';

export default function StockCard({ symbol, quote, onPress, onRemove }) {
  if (!quote) {
    return (
      <TouchableOpacity style={s.card} onPress={() => onPress && onPress(symbol)}>
        <View style={s.symbolRow}>
          <Text style={s.symbol}>{symbol}</Text>
          {onRemove && (
            <TouchableOpacity onPress={() => onRemove(symbol)} hitSlop={8}>
              <Text style={s.removeBtn}>x</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={s.loading}>Loading...</Text>
      </TouchableOpacity>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress && onPress(symbol)}>
      <View style={s.symbolRow}>
        <Text style={s.symbol}>{symbol}</Text>
        {onRemove && (
          <TouchableOpacity onPress={() => onRemove(symbol)} hitSlop={8}>
            <Text style={s.removeBtn}>x</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={s.price}>${quote.currentPrice?.toFixed(2)}</Text>
      <Text style={[s.change, isPositive ? s.positive : s.negative]}>
        {isPositive ? '+' : ''}{quote.change?.toFixed(2)} ({isPositive ? '+' : ''}{quote.percentChange?.toFixed(2)}%)
      </Text>
      <View style={s.chartArea}>
        <Sparkline quote={quote} height={60} width={145} />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    width: 170,
    marginRight: 10,
    marginBottom: 10,
  },
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  symbol: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  removeBtn: {
    color: colors.secondaryText,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  price: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  change: {
    fontSize: 12,
    marginBottom: 4,
  },
  positive: { color: colors.green },
  negative: { color: colors.red },
  loading: { color: colors.secondaryText, fontSize: 13 },
  chartArea: { marginTop: 2 },
});
