import Foundation
import Combine

final class StockDataViewModel: ObservableObject {
    @Published var quotes: [String: StockQuote] = [:]
    @Published var loading = false
    @Published var error: String?

    private var symbols: [String] = []
    private var timer: Timer?
    private let refreshInterval: TimeInterval = 30

    deinit {
        timer?.invalidate()
    }

    func startFetching(symbols: [String]) {
        self.symbols = symbols
        timer?.invalidate()

        fetchQuotes()

        timer = Timer.scheduledTimer(withTimeInterval: refreshInterval, repeats: true) { [weak self] _ in
            self?.fetchQuotes()
        }
    }

    func updateSymbols(_ newSymbols: [String]) {
        guard newSymbols != symbols else { return }
        symbols = newSymbols
        fetchQuotes()
    }

    func fetchQuotes() {
        guard !symbols.isEmpty else { return }

        loading = true
        error = nil

        Task { @MainActor in
            let data = await FinnhubService.shared.getMultipleQuotes(symbols: symbols)
            self.quotes = data
            self.loading = false

            // Record history for each quote
            for (symbol, quote) in data {
                PriceHistoryStore.shared.recordQuoteHistory(symbol: symbol, quote: quote)
            }
        }
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }
}
