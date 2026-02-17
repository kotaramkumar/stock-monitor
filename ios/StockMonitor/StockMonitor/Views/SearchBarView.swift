import SwiftUI

struct SearchBarView: View {
    @StateObject private var searchVM = SearchViewModel()
    @EnvironmentObject var watchlistVM: WatchlistViewModel
    @Binding var isPresented: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search field
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.appSecondaryText)

                    TextField("Search symbol or name...", text: $searchVM.query)
                        .foregroundColor(.appText)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.characters)
                        .onChange(of: searchVM.query) { _ in
                            searchVM.search()
                        }

                    if !searchVM.query.isEmpty {
                        Button {
                            searchVM.clear()
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.appSecondaryText)
                        }
                    }
                }
                .padding(12)
                .background(Color.appCard)
                .cornerRadius(10)
                .padding()

                if searchVM.isLoading {
                    ProgressView()
                        .tint(.appGreen)
                        .padding()
                }

                // Results list
                List(searchVM.results) { item in
                    Button {
                        watchlistVM.addSymbol(item.symbol)
                        isPresented = false
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 6) {
                                    Text(item.symbol)
                                        .font(.system(size: 15, weight: .bold))
                                        .foregroundColor(.appText)

                                    if item.isETF {
                                        Text("ETF")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(.appGreen)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Color.appGreen.opacity(0.15))
                                            .cornerRadius(4)
                                    }
                                }

                                Text(item.description)
                                    .font(.caption)
                                    .foregroundColor(.appSecondaryText)
                                    .lineLimit(1)
                            }

                            Spacer()

                            if watchlistVM.isInWatchlist(item.symbol) {
                                Text("Added")
                                    .font(.caption)
                                    .foregroundColor(.appSecondaryText)
                            } else {
                                Text("+ Add")
                                    .font(.caption)
                                    .foregroundColor(.appGreen)
                            }
                        }
                    }
                    .listRowBackground(Color.appBackground)
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)

                Spacer()
            }
            .background(Color.appBackground)
            .navigationTitle("Add Stock")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        isPresented = false
                    }
                    .foregroundColor(.appGreen)
                }
            }
        }
    }
}
