import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var watchlistVM: WatchlistViewModel
    @StateObject private var stockDataVM = StockDataViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                MarketOverviewView()

                HighVolumeStocksView()

                WatchlistView(stockDataVM: stockDataVM)
            }
            .padding()
        }
        .background(Color.appBackground)
        .navigationTitle("Stock Monitor")
        .navigationBarTitleDisplayMode(.large)
        .navigationDestination(for: String.self) { symbol in
            StockDetailView(symbol: symbol)
                .environmentObject(watchlistVM)
        }
        .onAppear {
            stockDataVM.startFetching(symbols: watchlistVM.watchlist)
        }
        .onChange(of: watchlistVM.watchlist) { newList in
            stockDataVM.updateSymbols(newList)
        }
        .onDisappear {
            stockDataVM.stop()
        }
    }
}
