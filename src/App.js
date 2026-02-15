import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StockDetail from './components/StockDetail';
import { useWatchlist } from './hooks/useWatchlist';
import { useStockData } from './hooks/useStockData';
import './App.css';

function App() {
  const [selectedStock, setSelectedStock] = useState(null);
  const { watchlist, addSymbol, removeSymbol, isInWatchlist } = useWatchlist();
  const { quotes } = useStockData(watchlist);

  function handleSelectStock(symbol) {
    setSelectedStock(symbol);
  }

  function handleGoHome() {
    setSelectedStock(null);
  }

  return (
    <div className="app">
      <Header onSelectStock={handleSelectStock} onGoHome={handleGoHome} />
      <main className="main">
        {selectedStock ? (
          <StockDetail
            symbol={selectedStock}
            isInWatchlist={isInWatchlist}
            onAddToWatchlist={addSymbol}
            onRemoveFromWatchlist={removeSymbol}
            onBack={handleGoHome}
          />
        ) : (
          <Dashboard
            watchlist={watchlist}
            quotes={quotes}
            onSelectStock={handleSelectStock}
            onRemoveSymbol={removeSymbol}
            onAddSymbol={addSymbol}
          />
        )}
      </main>
    </div>
  );
}

export default App;
