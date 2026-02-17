import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useStockData } from '../hooks/useStockData';
import StockCard from './StockCard';
import colors from '../theme/colors';

const STOCKS = ['SOFI', 'NIO', 'PLTR', 'SNAP', 'RIVN', 'LCID', 'AMC', 'SNDL'];
const ETFS = ['SQQQ', 'TQQQ', 'UVXY', 'SOXS', 'LABU', 'SPXS'];

export default function HighVolumeStocks({ onSelectStock }) {
  const [activeTab, setActiveTab] = useState('stocks');
  const visibleSymbols = activeTab === 'stocks' ? STOCKS : ETFS;
  const { quotes } = useStockData(visibleSymbols);

  return (
    <View style={s.container}>
      <View style={s.headingRow}>
        <Text style={s.heading}>High Volume, Low Price</Text>
        <View style={s.tabs}>
          <TouchableOpacity
            style={[s.tab, activeTab === 'stocks' && s.tabActive]}
            onPress={() => setActiveTab('stocks')}
          >
            <Text style={[s.tabText, activeTab === 'stocks' && s.tabTextActive]}>Stocks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab === 'etfs' && s.tabActive]}
            onPress={() => setActiveTab('etfs')}
          >
            <Text style={[s.tabText, activeTab === 'etfs' && s.tabTextActive]}>ETFs</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={visibleSymbols}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <StockCard symbol={item} quote={quotes[item]} onPress={onSelectStock} />
        )}
        numColumns={2}
        columnWrapperStyle={s.row}
        scrollEnabled={false}
        contentContainerStyle={s.grid}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 20, paddingHorizontal: 16 },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 4 },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: { color: colors.secondaryText, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  row: { justifyContent: 'space-between' },
  grid: { gap: 0 },
});
