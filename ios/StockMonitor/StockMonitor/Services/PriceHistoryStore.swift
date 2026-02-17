import Foundation

struct PriceHistoryEntry: Codable {
    let dateString: String
    var open: Double
    var high: Double
    var low: Double
    var close: Double

    var date: Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: dateString) ?? Date()
    }
}

final class PriceHistoryStore {
    static let shared = PriceHistoryStore()

    private let storageKey = "stock-monitor-price-history"
    private let defaults = UserDefaults.standard

    private init() {}

    private func loadHistory() -> [String: [PriceHistoryEntry]] {
        guard let data = defaults.data(forKey: storageKey),
              let history = try? JSONDecoder().decode([String: [PriceHistoryEntry]].self, from: data) else {
            return [:]
        }
        return history
    }

    private func saveHistory(_ history: [String: [PriceHistoryEntry]]) {
        if let data = try? JSONEncoder().encode(history) {
            defaults.set(data, forKey: storageKey)
        }
    }

    func recordQuoteHistory(symbol: String, quote: StockQuote) {
        guard quote.currentPrice > 0 else { return }

        var history = loadHistory()
        if history[symbol] == nil {
            history[symbol] = []
        }

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let today = formatter.string(from: Date())

        if let index = history[symbol]?.firstIndex(where: { $0.dateString == today }) {
            history[symbol]?[index].close = quote.currentPrice
            history[symbol]?[index].high = max(history[symbol]?[index].high ?? 0, quote.highPrice)
            history[symbol]?[index].low = min(history[symbol]?[index].low ?? Double.greatestFiniteMagnitude, quote.lowPrice)
        } else {
            history[symbol]?.append(PriceHistoryEntry(
                dateString: today,
                open: quote.openPrice,
                high: quote.highPrice,
                low: quote.lowPrice,
                close: quote.currentPrice
            ))
        }

        // Keep last 365 days
        if let entries = history[symbol], entries.count > 365 {
            history[symbol] = Array(entries.suffix(365))
        }

        saveHistory(history)
    }

    func getHistory(symbol: String) -> [PriceHistoryEntry] {
        let history = loadHistory()
        return history[symbol] ?? []
    }
}
