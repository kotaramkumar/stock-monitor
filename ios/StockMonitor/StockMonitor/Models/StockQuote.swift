import Foundation

struct FinnhubQuoteResponse: Codable {
    let c: Double   // current price
    let d: Double?  // change
    let dp: Double? // percent change
    let h: Double?  // high
    let l: Double?  // low
    let o: Double?  // open
    let pc: Double? // previous close
    let t: Int?     // timestamp
}

struct StockQuote: Codable, Identifiable {
    var id: String { symbol }
    let symbol: String
    let currentPrice: Double
    let change: Double
    let percentChange: Double
    let highPrice: Double
    let lowPrice: Double
    let openPrice: Double
    let previousClose: Double
    let timestamp: Int

    init(symbol: String, response: FinnhubQuoteResponse) {
        self.symbol = symbol
        self.currentPrice = response.c
        self.change = response.d ?? 0
        self.percentChange = response.dp ?? 0
        self.highPrice = response.h ?? response.c
        self.lowPrice = response.l ?? response.c
        self.openPrice = response.o ?? response.c
        self.previousClose = response.pc ?? response.c
        self.timestamp = response.t ?? Int(Date().timeIntervalSince1970)
    }

    var isPositive: Bool { change >= 0 }

    var formattedPrice: String {
        String(format: "$%.2f", currentPrice)
    }

    var formattedChange: String {
        let sign = isPositive ? "+" : ""
        return "\(sign)\(String(format: "%.2f", change))"
    }

    var formattedPercentChange: String {
        let sign = isPositive ? "+" : ""
        return "\(sign)\(String(format: "%.2f", percentChange))%"
    }
}
