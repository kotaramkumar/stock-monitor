// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "StockMonitor",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "StockMonitor",
            targets: ["StockMonitor"]
        )
    ],
    targets: [
        .target(
            name: "StockMonitor",
            path: "StockMonitor"
        )
    ]
)
