import SwiftUI

extension Color {
    static let appBackground = Color(red: 0x13/255, green: 0x15/255, blue: 0x1e/255)
    static let appCard = Color(red: 0x1e/255, green: 0x21/255, blue: 0x30/255)
    static let appBorder = Color(red: 0x2d/255, green: 0x31/255, blue: 0x48/255)
    static let appGreen = Color(red: 0x00/255, green: 0xc8/255, blue: 0x53/255)
    static let appRed = Color(red: 0xff/255, green: 0x52/255, blue: 0x52/255)
    static let appText = Color(red: 0xe0/255, green: 0xe0/255, blue: 0xe0/255)
    static let appSecondaryText = Color(red: 0x6b/255, green: 0x72/255, blue: 0x80/255)

    static func stockColor(isPositive: Bool) -> Color {
        isPositive ? .appGreen : .appRed
    }
}

struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(12)
            .background(Color.appCard)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.appBorder, lineWidth: 1)
            )
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}
