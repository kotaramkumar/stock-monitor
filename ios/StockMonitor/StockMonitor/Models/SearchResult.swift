import Foundation

struct FinnhubSearchResponse: Codable {
    let result: [SearchResult]?
}

struct SearchResult: Codable, Identifiable {
    var id: String { symbol }
    let symbol: String
    let description: String
    let type: String
    let displaySymbol: String

    var isETF: Bool { type == "ETP" }
}
