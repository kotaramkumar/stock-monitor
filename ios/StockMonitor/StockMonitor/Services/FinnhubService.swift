import Foundation

enum FinnhubError: LocalizedError {
    case rateLimited
    case apiError(Int)
    case invalidURL
    case decodingError

    var errorDescription: String? {
        switch self {
        case .rateLimited:
            return "Rate limit exceeded. Please wait a moment."
        case .apiError(let code):
            return "API error: \(code)"
        case .invalidURL:
            return "Invalid URL"
        case .decodingError:
            return "Failed to decode response"
        }
    }
}

final class FinnhubService {
    static let shared = FinnhubService()

    // Replace with your Finnhub API key
    private let apiKey = "d68ij6pr01qq5rjfmomgd68ij6pr01qq5rjfmon0"
    private let baseURL = "https://finnhub.io/api/v1"
    private let session: URLSession

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 15
        self.session = URLSession(configuration: config)
    }

    private func buildURL(endpoint: String, params: [String: String] = [:]) throws -> URL {
        guard var components = URLComponents(string: "\(baseURL)\(endpoint)") else {
            throw FinnhubError.invalidURL
        }
        var queryItems = [URLQueryItem(name: "token", value: apiKey)]
        for (key, value) in params {
            queryItems.append(URLQueryItem(name: key, value: value))
        }
        components.queryItems = queryItems
        guard let url = components.url else {
            throw FinnhubError.invalidURL
        }
        return url
    }

    private func fetchData<T: Decodable>(_ type: T.Type, endpoint: String, params: [String: String] = [:]) async throws -> T {
        let url = try buildURL(endpoint: endpoint, params: params)
        let (data, response) = try await session.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw FinnhubError.apiError(0)
        }

        if httpResponse.statusCode == 429 {
            throw FinnhubError.rateLimited
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw FinnhubError.apiError(httpResponse.statusCode)
        }

        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw FinnhubError.decodingError
        }
    }

    // MARK: - Public API

    func getQuote(symbol: String) async throws -> StockQuote {
        let response = try await fetchData(FinnhubQuoteResponse.self, endpoint: "/quote", params: ["symbol": symbol])
        return StockQuote(symbol: symbol, response: response)
    }

    func searchSymbol(query: String) async throws -> [SearchResult] {
        let response = try await fetchData(FinnhubSearchResponse.self, endpoint: "/search", params: ["q": query])
        let allowedTypes: Set<String> = ["Common Stock", "ETP"]
        return (response.result ?? []).filter { item in
            allowedTypes.contains(item.type) && !item.symbol.contains(".")
        }
    }

    func getCompanyProfile(symbol: String) async throws -> CompanyProfile {
        return try await fetchData(CompanyProfile.self, endpoint: "/stock/profile2", params: ["symbol": symbol])
    }

    func getMultipleQuotes(symbols: [String]) async -> [String: StockQuote] {
        var results: [String: StockQuote] = [:]
        let batchSize = 5

        for batchStart in stride(from: 0, to: symbols.count, by: batchSize) {
            let batchEnd = min(batchStart + batchSize, symbols.count)
            let batch = Array(symbols[batchStart..<batchEnd])

            await withTaskGroup(of: (String, StockQuote?).self) { group in
                for symbol in batch {
                    group.addTask {
                        do {
                            let quote = try await self.getQuote(symbol: symbol)
                            return (symbol, quote)
                        } catch {
                            return (symbol, nil)
                        }
                    }
                }
                for await (symbol, quote) in group {
                    if let quote = quote {
                        results[symbol] = quote
                    }
                }
            }

            if batchEnd < symbols.count {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
            }
        }

        return results
    }

    func getChartData(symbol: String, quote: StockQuote?) -> ChartData {
        var intradayPoints: [ChartDataPoint] = []

        if let quote = quote {
            let now = Date()
            let calendar = Calendar.current
            var marketOpenComponents = calendar.dateComponents([.year, .month, .day], from: now)
            marketOpenComponents.hour = 9
            marketOpenComponents.minute = 30
            let marketOpen = calendar.date(from: marketOpenComponents) ?? now

            let elapsed = now.timeIntervalSince(marketOpen)

            intradayPoints.append(ChartDataPoint(
                time: marketOpen.addingTimeInterval(-60),
                close: quote.previousClose
            ))

            intradayPoints.append(ChartDataPoint(
                time: marketOpen,
                close: quote.openPrice
            ))

            if quote.lowPrice != quote.openPrice {
                intradayPoints.append(ChartDataPoint(
                    time: marketOpen.addingTimeInterval(elapsed * 0.3),
                    close: quote.lowPrice
                ))
            }

            if quote.highPrice != quote.lowPrice {
                intradayPoints.append(ChartDataPoint(
                    time: marketOpen.addingTimeInterval(elapsed * 0.6),
                    close: quote.highPrice
                ))
            }

            intradayPoints.append(ChartDataPoint(
                time: now,
                close: quote.currentPrice
            ))
        }

        let historicalPoints = PriceHistoryStore.shared.getHistory(symbol: symbol).map { entry in
            ChartDataPoint(
                time: entry.date,
                close: entry.close,
                open: entry.open,
                high: entry.high,
                low: entry.low
            )
        }

        return ChartData(intradayPoints: intradayPoints, historicalPoints: historicalPoints)
    }
}
