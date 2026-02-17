import SwiftUI

private let indices: [(symbol: String, name: String)] = [
    ("SPY", "S&P 500"),
    ("QQQ", "NASDAQ"),
    ("DIA", "Dow Jones"),
    ("IWM", "Russell 2000"),
]

struct MarketOverviewView: View {
    @StateObject private var viewModel = StockDataViewModel()

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Market Overview")
                .font(.headline)
                .foregroundColor(.appText)
                .padding(.horizontal, 4)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(indices, id: \.symbol) { index in
                        marketCard(symbol: index.symbol, name: index.name)
                    }
                }
            }
        }
        .onAppear {
            viewModel.startFetching(symbols: indices.map(\.symbol))
        }
        .onDisappear {
            viewModel.stop()
        }
    }

    @ViewBuilder
    private func marketCard(symbol: String, name: String) -> some View {
        let quote = viewModel.quotes[symbol]
        let isPositive = quote?.isPositive ?? true

        VStack(alignment: .leading, spacing: 4) {
            Text(name)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.appSecondaryText)

            Text(quote?.formattedPrice ?? "\u{2014}")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.appText)

            if let quote = quote {
                Text(quote.formattedPercentChange)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(Color.stockColor(isPositive: isPositive))
            }

            SparklineView(quote: quote, height: 35)
        }
        .frame(width: 150)
        .cardStyle()
    }
}
