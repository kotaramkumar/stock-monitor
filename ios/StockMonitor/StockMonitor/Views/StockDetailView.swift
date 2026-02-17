import SwiftUI

struct StockDetailView: View {
    let symbol: String
    @EnvironmentObject var watchlistVM: WatchlistViewModel
    @State private var quote: StockQuote?
    @State private var profile: CompanyProfile?
    @State private var loading = true

    private var inWatchlist: Bool {
        watchlistVM.isInWatchlist(symbol)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if loading {
                    ProgressView("Loading \(symbol)...")
                        .tint(.appGreen)
                        .frame(maxWidth: .infinity, minHeight: 200)
                } else {
                    // Header
                    headerSection

                    // Price
                    if let quote = quote {
                        priceSection(quote: quote)
                    }

                    // Chart
                    StockChartView(symbol: symbol)
                        .padding(.vertical, 8)

                    // Stats
                    if let quote = quote {
                        statsGrid(quote: quote)
                    }

                    // Company Info
                    if let profile = profile, (profile.finnhubIndustry != nil || profile.country != nil) {
                        companyInfoSection(profile: profile)
                    }
                }
            }
            .padding()
        }
        .background(Color.appBackground)
        .navigationTitle(symbol)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    if inWatchlist {
                        watchlistVM.removeSymbol(symbol)
                    } else {
                        watchlistVM.addSymbol(symbol)
                    }
                } label: {
                    Image(systemName: inWatchlist ? "star.fill" : "star")
                        .foregroundColor(inWatchlist ? .yellow : .appSecondaryText)
                }
            }
        }
        .task {
            await loadData()
        }
    }

    // MARK: - Sections

    @ViewBuilder
    private var headerSection: some View {
        HStack(spacing: 12) {
            if let logoURL = profile?.logo, let url = URL(string: logoURL) {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFit()
                } placeholder: {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.appCard)
                }
                .frame(width: 48, height: 48)
                .cornerRadius(8)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(symbol)
                    .font(.title2.weight(.bold))
                    .foregroundColor(.appText)

                Text(profile?.name ?? symbol)
                    .font(.subheadline)
                    .foregroundColor(.appSecondaryText)
            }

            Spacer()
        }
    }

    @ViewBuilder
    private func priceSection(quote: StockQuote) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(quote.formattedPrice)
                .font(.system(size: 36, weight: .bold))
                .foregroundColor(.appText)

            Text("\(quote.formattedChange) (\(quote.formattedPercentChange))")
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(Color.stockColor(isPositive: quote.isPositive))
        }
    }

    @ViewBuilder
    private func statsGrid(quote: StockQuote) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
            ], spacing: 12) {
                statItem(label: "Open", value: String(format: "$%.2f", quote.openPrice))
                statItem(label: "High", value: String(format: "$%.2f", quote.highPrice))
                statItem(label: "Low", value: String(format: "$%.2f", quote.lowPrice))
                statItem(label: "Prev Close", value: String(format: "$%.2f", quote.previousClose))
            }
        }
        .cardStyle()
    }

    @ViewBuilder
    private func statItem(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption)
                .foregroundColor(.appSecondaryText)
            Text(value)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.appText)
        }
    }

    @ViewBuilder
    private func companyInfoSection(profile: CompanyProfile) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(profile.finnhubIndustry != nil ? "Company Info" : "Fund Info")
                .font(.headline)
                .foregroundColor(.appText)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
            ], spacing: 12) {
                if let industry = profile.finnhubIndustry {
                    profileItem(label: "Industry", value: industry)
                }
                if let country = profile.country {
                    profileItem(label: "Country", value: country)
                }
                if let exchange = profile.exchange {
                    profileItem(label: "Exchange", value: exchange)
                }
                if let marketCap = profile.formattedMarketCap {
                    profileItem(label: "Market Cap", value: marketCap)
                }
            }

            if let urlString = profile.weburl, let url = URL(string: urlString) {
                HStack {
                    Text("Website")
                        .font(.caption)
                        .foregroundColor(.appSecondaryText)
                    Link(profile.cleanWebURL ?? urlString, destination: url)
                        .font(.system(size: 13))
                        .foregroundColor(.appGreen)
                }
            }
        }
        .cardStyle()
    }

    @ViewBuilder
    private func profileItem(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption)
                .foregroundColor(.appSecondaryText)
            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.appText)
        }
    }

    // MARK: - Data Loading

    private func loadData() async {
        loading = true
        async let q = FinnhubService.shared.getQuote(symbol: symbol)
        async let p = FinnhubService.shared.getCompanyProfile(symbol: symbol)

        do {
            let (quoteResult, profileResult) = try await (q, p)
            await MainActor.run {
                self.quote = quoteResult
                self.profile = profileResult
                self.loading = false
            }
        } catch {
            await MainActor.run {
                self.loading = false
            }
        }
    }
}
