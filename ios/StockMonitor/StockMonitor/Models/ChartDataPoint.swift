import Foundation

struct ChartDataPoint: Identifiable {
    let id = UUID()
    let time: Date
    let close: Double
    var open: Double?
    var high: Double?
    var low: Double?
}

struct ChartData {
    let intradayPoints: [ChartDataPoint]
    let historicalPoints: [ChartDataPoint]
}
