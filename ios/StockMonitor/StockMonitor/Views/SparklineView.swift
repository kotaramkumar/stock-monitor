import SwiftUI
import Charts

struct SparklineView: View {
    let quote: StockQuote?
    let height: CGFloat

    init(quote: StockQuote?, height: CGFloat = 45) {
        self.quote = quote
        self.height = height
    }

    private var dataPoints: [(index: Int, value: Double)] {
        guard let quote = quote, quote.currentPrice > 0 else { return [] }

        var points: [Double] = []
        if quote.previousClose > 0 { points.append(quote.previousClose) }
        if quote.openPrice > 0 { points.append(quote.openPrice) }
        if quote.lowPrice > 0 { points.append(quote.lowPrice) }
        if quote.highPrice > 0 { points.append(quote.highPrice) }
        points.append(quote.currentPrice)

        return points.enumerated().map { (index: $0.offset, value: $0.element) }
    }

    var body: some View {
        if dataPoints.count < 2 {
            Text("\u{2014}")
                .font(.caption2)
                .foregroundColor(.appSecondaryText)
                .frame(height: height)
        } else {
            let isPositive = quote?.isPositive ?? true
            let color = Color.stockColor(isPositive: isPositive)

            Chart(dataPoints, id: \.index) { point in
                LineMark(
                    x: .value("Index", point.index),
                    y: .value("Price", point.value)
                )
                .foregroundStyle(color)
                .interpolationMethod(.catmullRom)

                AreaMark(
                    x: .value("Index", point.index),
                    y: .value("Price", point.value)
                )
                .foregroundStyle(
                    .linearGradient(
                        colors: [color.opacity(0.25), color.opacity(0)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .interpolationMethod(.catmullRom)
            }
            .chartXAxis(.hidden)
            .chartYAxis(.hidden)
            .chartLegend(.hidden)
            .frame(height: height)
        }
    }
}
