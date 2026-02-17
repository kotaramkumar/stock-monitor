import SwiftUI

private let highVolumeStocks = ["SOFI", "NIO", "PLTR", "SNAP", "RIVN", "LCID", "AMC", "SNDL"]
private let highVolumeETFs = ["SQQQ", "TQQQ", "UVXY", "SOXS", "LABU", "SPXS"]

struct HighVolumeStocksView: View {
    @StateObject private var viewModel = StockDataViewModel()
    @State private var activeTab = "stocks"

    private var visibleSymbols: [String] {
        activeTab == "stocks" ? highVolumeStocks : highVolumeETFs
    }

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("High Volume, Low Price")
                    .font(.headline)
                    .foregroundColor(.appText)

                Spacer()

                Picker("", selection: $activeTab) {
                    Text("Stocks").tag("stocks")
                    Text("ETFs").tag("etfs")
                }
                .pickerStyle(.segmented)
                .frame(width: 150)
            }
            .padding(.horizontal, 4)

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(visibleSymbols, id: \.self) { symbol in
                    NavigationLink(value: symbol) {
                        StockCardView(symbol: symbol, quote: viewModel.quotes[symbol])
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .onAppear {
            viewModel.startFetching(symbols: visibleSymbols)
        }
        .onChange(of: activeTab) { _ in
            viewModel.startFetching(symbols: visibleSymbols)
        }
        .onDisappear {
            viewModel.stop()
        }
    }
}
