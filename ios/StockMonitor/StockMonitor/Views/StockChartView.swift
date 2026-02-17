import SwiftUI
import Charts

struct StockChartView: View {
    let symbol: String
    @State private var chartData: [ChartDataPoint] = []
    @State private var loading = false
    @State private var view: String = "today"

    private var isPositive: Bool {
        guard chartData.count > 1 else { return true }
        return chartData.last!.close >= chartData.first!.close
    }

    private var chartColor: Color {
        Color.stockColor(isPositive: isPositive)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // View toggle
            Picker("", selection: $view) {
                Text("Today").tag("today")
                Text("History").tag("history")
            }
            .pickerStyle(.segmented)

            if loading {
                ProgressView("Loading chart...")
                    .tint(.appGreen)
                    .frame(height: 250)
                    .frame(maxWidth: .infinity)
            } else if chartData.isEmpty {
                Text(view == "history"
                     ? "Price history builds over time as you use the app. Check back later!"
                     : "No price data available right now.")
                    .font(.subheadline)
                    .foregroundColor(.appSecondaryText)
                    .frame(height: 250)
                    .frame(maxWidth: .infinity)
            } else {
                Chart(chartData) { point in
                    LineMark(
                        x: .value("Time", point.time),
                        y: .value("Price", point.close)
                    )
                    .foregroundStyle(chartColor)
                    .interpolationMethod(.catmullRom)

                    AreaMark(
                        x: .value("Time", point.time),
                        y: .value("Price", point.close)
                    )
                    .foregroundStyle(
                        .linearGradient(
                            colors: [chartColor.opacity(0.3), chartColor.opacity(0)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .interpolationMethod(.catmullRom)
                }
                .chartXAxis {
                    AxisMarks(values: .automatic) { value in
                        AxisValueLabel {
                            if let date = value.as(Date.self) {
                                if view == "today" {
                                    Text(date, format: .dateTime.hour().minute())
                                        .font(.caption2)
                                } else {
                                    Text(date, format: .dateTime.month(.abbreviated).day())
                                        .font(.caption2)
                                }
                            }
                        }
                        AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [3, 3]))
                            .foregroundStyle(Color.appBorder)
                    }
                }
                .chartYAxis {
                    AxisMarks(position: .leading) { value in
                        AxisValueLabel {
                            if let price = value.as(Double.self) {
                                Text("$\(String(format: "%.0f", price))")
                                    .font(.caption2)
                            }
                        }
                        AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [3, 3]))
                            .foregroundStyle(Color.appBorder)
                    }
                }
                .frame(height: 250)
            }
        }
        .onAppear { fetchData() }
        .onChange(of: view) { _ in fetchData() }
    }

    private func fetchData() {
        loading = true
        Task { @MainActor in
            do {
                let quote = try await FinnhubService.shared.getQuote(symbol: symbol)
                PriceHistoryStore.shared.recordQuoteHistory(symbol: symbol, quote: quote)
                let data = FinnhubService.shared.getChartData(symbol: symbol, quote: quote)

                if view == "today" {
                    chartData = data.intradayPoints
                } else {
                    var all = data.historicalPoints
                    if let latest = data.intradayPoints.last {
                        let calendar = Calendar.current
                        let hasToday = all.contains { calendar.isDateInToday($0.time) }
                        if !hasToday {
                            all.append(latest)
                        }
                    }
                    chartData = all
                }
            } catch {
                chartData = []
            }
            loading = false
        }
    }
}
