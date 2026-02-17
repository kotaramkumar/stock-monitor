import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import StockCard from './StockCard';
import SearchBar from './SearchBar';
import colors from '../theme/colors';

export default function WatchlistSection({ watchlist, quotes, onSelectStock, onRemoveSymbol, onAddSymbol }) {
  const [showSearch, setShowSearch] = useState(false);

  const sorted = [...watchlist].sort((a, b) => {
    const aChange = quotes[a]?.percentChange ?? 0;
    const bChange = quotes[b]?.percentChange ?? 0;
    return bChange - aChange;
  });

  const withQuotes = sorted.filter((s) => quotes[s]?.percentChange != null);
  const gainers = withQuotes.filter((s) => quotes[s].percentChange >= 0).slice(0, 3);
  const losers = withQuotes.filter((s) => quotes[s].percentChange < 0).slice(0, 3);

  return (
    <View style={s.container}>
      {gainers.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}><Text style={s.gainIcon}>&#9650; </Text>Top Gainers</Text>
          {gainers.map((symbol) => (
            <TouchableOpacity key={symbol} style={s.miniItem} onPress={() => onSelectStock(symbol)}>
              <Text style={s.miniSymbol}>{symbol}</Text>
              <Text style={s.gainText}>+{quotes[symbol].percentChange.toFixed(2)}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {losers.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}><Text style={s.loseIcon}>&#9660; </Text>Top Losers</Text>
          {losers.map((symbol) => (
            <TouchableOpacity key={symbol} style={s.miniItem} onPress={() => onSelectStock(symbol)}>
              <Text style={s.miniSymbol}>{symbol}</Text>
              <Text style={s.loseText}>{quotes[symbol].percentChange.toFixed(2)}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={s.headingRow}>
        <Text style={s.heading}>Watchlist ({watchlist.length})</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowSearch(true)}>
          <Text style={s.addBtnText}>+ Add Stock</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={watchlist}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <StockCard
            symbol={item}
            quote={quotes[item]}
            onPress={onSelectStock}
            onRemove={onRemoveSymbol}
          />
        )}
        numColumns={2}
        columnWrapperStyle={s.row}
        scrollEnabled={false}
      />

      {watchlist.length === 0 && (
        <Text style={s.empty}>Your watchlist is empty. Search for stocks to add them.</Text>
      )}

      <SearchBar
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        onAdd={onAddSymbol}
        watchlist={watchlist}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 20 },
  section: { marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  gainIcon: { color: colors.green },
  loseIcon: { color: colors.red },
  miniItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  miniSymbol: { color: colors.text, fontWeight: '600', fontSize: 14 },
  gainText: { color: colors.green, fontWeight: '700', fontSize: 14 },
  loseText: { color: colors.red, fontWeight: '700', fontSize: 14 },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  addBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  row: { justifyContent: 'space-between' },
  empty: { color: colors.secondaryText, textAlign: 'center', marginTop: 20, fontSize: 14 },
});
