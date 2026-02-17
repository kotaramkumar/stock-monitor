import Foundation

final class WatchlistViewModel: ObservableObject {
    @Published var watchlist: [String] = []

    private let storageKey = "stock-monitor-watchlist"
    private let defaults = UserDefaults.standard
    private let defaultWatchlist = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]

    init() {
        loadWatchlist()
    }

    private func loadWatchlist() {
        if let data = defaults.data(forKey: storageKey),
           let stored = try? JSONDecoder().decode([String].self, from: data) {
            watchlist = stored
        } else {
            watchlist = defaultWatchlist
        }
    }

    private func saveWatchlist() {
        if let data = try? JSONEncoder().encode(watchlist) {
            defaults.set(data, forKey: storageKey)
        }
    }

    func addSymbol(_ symbol: String) {
        let upper = symbol.uppercased()
        guard !watchlist.contains(upper) else { return }
        watchlist.append(upper)
        saveWatchlist()
    }

    func removeSymbol(_ symbol: String) {
        let upper = symbol.uppercased()
        watchlist.removeAll { $0 == upper }
        saveWatchlist()
    }

    func isInWatchlist(_ symbol: String) -> Bool {
        watchlist.contains(symbol.uppercased())
    }
}
