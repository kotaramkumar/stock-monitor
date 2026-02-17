import SwiftUI

struct ContentView: View {
    @StateObject private var watchlistVM = WatchlistViewModel()

    var body: some View {
        NavigationStack {
            DashboardView()
                .environmentObject(watchlistVM)
        }
        .tint(.appGreen)
    }
}
