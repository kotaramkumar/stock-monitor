import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MarketOverview from '../components/MarketOverview';
import HighVolumeStocks from '../components/HighVolumeStocks';
import WatchlistSection from '../components/Watchlist';
import { useStockData } from '../hooks/useStockData';
import colors from '../theme/colors';

export default function DashboardScreen({ onSelectStock, watchlist, addSymbol, removeSymbol }) {
  const { quotes } = useStockData(watchlist);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.container}>
        <Text style={s.title}>Stock Monitor</Text>
        <MarketOverview onSelectStock={onSelectStock} />
        <HighVolumeStocks onSelectStock={onSelectStock} />
        <WatchlistSection
          watchlist={watchlist}
          quotes={quotes}
          onSelectStock={onSelectStock}
          onRemoveSymbol={removeSymbol}
          onAddSymbol={addSymbol}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
});
