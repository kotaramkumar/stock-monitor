import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import StockDetailScreen from './src/screens/StockDetailScreen';
import { useWatchlist } from './src/hooks/useWatchlist';

export default function App() {
  const { watchlist, addSymbol, removeSymbol, isInWatchlist } = useWatchlist();
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {selectedSymbol ? (
        <StockDetailScreen
          symbol={selectedSymbol}
          onBack={() => setSelectedSymbol(null)}
          isInWatchlist={isInWatchlist}
          addSymbol={addSymbol}
          removeSymbol={removeSymbol}
        />
      ) : (
        <DashboardScreen
          onSelectStock={setSelectedSymbol}
          watchlist={watchlist}
          addSymbol={addSymbol}
          removeSymbol={removeSymbol}
        />
      )}
    </SafeAreaProvider>
  );
}
