import Foundation

struct CompanyProfile: Codable {
    let name: String?
    let logo: String?
    let finnhubIndustry: String?
    let country: String?
    let exchange: String?
    let marketCapitalization: Double?
    let weburl: String?

    var formattedMarketCap: String? {
        guard let cap = marketCapitalization, cap > 0 else { return nil }
        return String(format: "$%.1fB", cap / 1000)
    }

    var cleanWebURL: String? {
        guard let url = weburl, !url.isEmpty else { return nil }
        return url
            .replacingOccurrences(of: "https://www.", with: "")
            .replacingOccurrences(of: "http://www.", with: "")
            .replacingOccurrences(of: "https://", with: "")
            .replacingOccurrences(of: "http://", with: "")
    }
}
