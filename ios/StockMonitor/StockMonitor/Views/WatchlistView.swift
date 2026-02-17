import SwiftUI

struct WatchlistView: View {
    @EnvironmentObject var watchlistVM: WatchlistViewModel
    @ObservedObject var stockDataVM: StockDataViewModel
    @State private var showSearch = false

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    private var sortedSymbols: [String] {
        watchlistVM.watchlist.sorted { a, b in
            let aChange = stockDataVM.quotes[a]?.percentChange ?? 0
            let bChange = stockDataVM.quotes[b]?.percentChange ?? 0
            return bChange > aChange
        }
    }

    private var gainers: [(String, StockQuote)] {
        sortedSymbols.compactMap { symbol in
            guard let quote = stockDataVM.quotes[symbol], quote.percentChange >= 0 else { return nil }
            return (symbol, quote)
        }.prefix(3).map { $0 }
    }

    private var losers: [(String, StockQuote)] {
        sortedSymbols.reversed().compactMap { symbol in
            guard let quote = stockDataVM.quotes[symbol], quote.percentChange < 0 else { return nil }
            return (symbol, quote)
        }.prefix(3).map { $0 }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Top Gainers
            if !gainers.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 4) {
                        Image(systemName: "arrowtriangle.up.fill")
                            .font(.caption2)
                            .foregroundColor(.appGreen)
                        Text("Top Gainers")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.appText)
                    }

                    ForEach(gainers, id: \.0) { symbol, quote in
                        NavigationLink(value: symbol) {
                            HStack {
                                Text(symbol)
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.appText)
                                Spacer()
                                Text("+\(String(format: "%.2f", quote.percentChange))%")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.appGreen)
                            }
                            .padding(.vertical, 4)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 4)
            }

            // Top Losers
            if !losers.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 4) {
                        Image(systemName: "arrowtriangle.down.fill")
                            .font(.caption2)
                            .foregroundColor(.appRed)
                        Text("Top Losers")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.appText)
                    }

                    ForEach(losers, id: \.0) { symbol, quote in
                        NavigationLink(value: symbol) {
                            HStack {
                                Text(symbol)
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.appText)
                                Spacer()
                                Text("\(String(format: "%.2f", quote.percentChange))%")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.appRed)
                            }
                            .padding(.vertical, 4)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 4)
            }

            // Watchlist header
            HStack {
                Text("Watchlist (\(watchlistVM.watchlist.count))")
                    .font(.headline)
                    .foregroundColor(.appText)

                Spacer()

                Button {
                    showSearch = true
                } label: {
                    Label("Add Stock", systemImage: "plus")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.appGreen)
                }
            }
            .padding(.horizontal, 4)

            if watchlistVM.watchlist.isEmpty {
                Text("Your watchlist is empty. Search for stocks to add them.")
                    .font(.subheadline)
                    .foregroundColor(.appSecondaryText)
                    .padding()
            } else {
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(watchlistVM.watchlist, id: \.self) { symbol in
                        NavigationLink(value: symbol) {
                            StockCardView(
                                symbol: symbol,
                                quote: stockDataVM.quotes[symbol],
                                onRemove: { sym in
                                    watchlistVM.removeSymbol(sym)
                                }
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
        .sheet(isPresented: $showSearch) {
            SearchBarView(isPresented: $showSearch)
                .environmentObject(watchlistVM)
        }
    }
}
