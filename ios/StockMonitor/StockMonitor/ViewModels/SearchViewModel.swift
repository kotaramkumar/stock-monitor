import Foundation
import Combine

final class SearchViewModel: ObservableObject {
    @Published var query = ""
    @Published var results: [SearchResult] = []
    @Published var isLoading = false

    private var debounceTask: Task<Void, Never>?

    func search() {
        debounceTask?.cancel()

        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count >= 1 else {
            results = []
            isLoading = false
            return
        }

        isLoading = true

        debounceTask = Task { @MainActor in
            // 400ms debounce
            try? await Task.sleep(nanoseconds: 400_000_000)

            guard !Task.isCancelled else { return }

            do {
                let data = try await FinnhubService.shared.searchSymbol(query: trimmed)
                guard !Task.isCancelled else { return }
                self.results = Array(data.prefix(6))
            } catch {
                guard !Task.isCancelled else { return }
                self.results = []
            }
            self.isLoading = false
        }
    }

    func clear() {
        debounceTask?.cancel()
        query = ""
        results = []
        isLoading = false
    }
}
