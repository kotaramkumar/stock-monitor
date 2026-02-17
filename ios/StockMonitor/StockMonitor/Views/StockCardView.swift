import SwiftUI

struct StockCardView: View {
    let symbol: String
    let quote: StockQuote?
    var onRemove: ((String) -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(symbol)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.appText)

                Spacer()

                if let onRemove = onRemove {
                    Button {
                        onRemove(symbol)
                    } label: {
                        Image(systemName: "xmark")
                            .font(.caption)
                            .foregroundColor(.appSecondaryText)
                    }
                    .buttonStyle(.plain)
                }
            }

            if let quote = quote {
                Text(quote.formattedPrice)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.appText)

                HStack(spacing: 4) {
                    Text(quote.formattedChange)
                    Text("(\(quote.formattedPercentChange))")
                }
                .font(.system(size: 12))
                .foregroundColor(Color.stockColor(isPositive: quote.isPositive))

                SparklineView(quote: quote, height: 40)
            } else {
                Text("Loading...")
                    .font(.caption)
                    .foregroundColor(.appSecondaryText)
                Spacer()
            }
        }
        .cardStyle()
    }
}
