# EventHub - Cross-Platform Event Booking Mobile Application

A cross-platform mobile application developed using **React Native**, **TypeScript**, and **Expo** to help users discover and book events in their area, and empower event organizers to publish and manage their events.

Developed for the **Cross-Platform Mobile Application Development** academic module.

---

## 📱 Features

### 1. User Authentication & Role-Based Access
- **Authentication**: Email and password login & registration with real-time field validation.
- **Role Modes**: Seamless switching between **Attendee** (discover & book) and **Organizer** (create & manage) modes.
- **Quick Demo Access**: 1-tap demo credentials for quick evaluation (Demo Attendee & Demo Organizer).
- **Profile Management**: Editable user information (Name, Phone, Avatar) and in-app/push notifications preference toggles.
- **Local Persistence**: User sessions, cached bookmarks, and state persisted via `@react-native-async-storage/async-storage`.

### 2. Event Discovery & Browsing
- **Live Search**: Instant keyword search for event titles, venues, and descriptions.
- **Category Filtering**: Horizontal filter pills (Music, Technology, Sports, Arts, Food & Drink, Business & Workshops).
- **Seat Availability Indicators**:
  - 🟢 `X seats available`
  - 🟡 `Only X seats left!` (urgent warning for $\le 15$ seats)
  - 🔴 `Sold Out` (0 seats remaining, with automatic booking CTA disabling)
- **Interactive Event Cards**: Rich cover photography, date, time, location, price, and instant favorite toggles.

### 3. Rich Event Details
- Full-bleed hero banner with navigation controls.
- Comprehensive date/time and venue address cards.
- Verified organizer details card.
- Dynamic visual seat capacity progress bar (booked vs total capacity).
- Detailed event description and sticky bottom booking bar.

### 4. Favorites & Offline Bookmarking
- Instant 1-tap event bookmarking from cards or details screen.
- Dedicated "Saved" tab to view all bookmarked events.
- Offline persistence via local storage.

### 5. Ticket Booking Flow & Management
- Interactive ticket quantity counter with capacity boundary checks.
- Dynamic pricing calculation and breakdown.
- Auto-populated attendee contact info with custom notes support.
- Unique booking reference code generation (`EVT-XXXXX`).
- Scannable digital ticket pass with QR/barcode representation.
- My Bookings management with Active vs. Past/Cancelled tabs.
- 1-tap booking cancellation with atomic seat restitution back to event capacity.

---

## 🛠️ Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) (v0.81 / 0.86) with [Expo SDK 57](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Navigation**: [React Navigation 7](https://reactnavigation.org/) (Native Stack & Bottom Tabs)
- **Icons**: [@expo/vector-icons](https://icons.expo.fyi/) (Ionicons)
- **Storage**: [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)
- **Safe Area**: `react-native-safe-area-context`
- **Target Platform**: Android (Tested on Pixel 10 emulator, Android 16, API 36) & iOS

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on a physical device OR Android Studio Emulator / Xcode Simulator

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rajithan-Pathmanathan/crossplatform-mobile-application.git
   cd crossplatform-mobile-application
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Run on Android Emulator**:
   ```bash
   npx expo start --android
   ```

---

## 🔑 Demo Accounts

For immediate testing, use the 1-tap demo buttons on the Login screen:
- **Attendee**: `attendee@eventhub.com` / `password123`
- **Organizer**: `organizer@eventhub.com` / `password123`

---

## 📂 Project Architecture

```
eventhub/
├── App.tsx                    # Root application entry point & providers
├── src/
│   ├── components/            # Reusable UI component system
│   │   ├── CategoryChipBar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── EventCard.tsx
│   │   └── SearchBar.tsx
│   ├── constants/             # Design tokens, categories, mock database
│   │   ├── categories.ts
│   │   ├── colors.ts
│   │   └── mockData.ts
│   ├── context/               # Global state providers
│   │   └── AuthContext.tsx
│   ├── navigation/            # Typed navigation architecture
│   │   ├── MainTabNavigator.tsx
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── screens/               # Application screen modules
│   │   ├── auth/              # Login & Register
│   │   ├── bookings/          # My Bookings & Passes
│   │   ├── explore/           # Explore feed & Event Details
│   │   ├── favorites/         # Offline Bookmarks
│   │   ├── organizer/         # Organizer Studio
│   │   └── profile/           # User Profile & Preferences
│   ├── services/              # REST API simulation & storage
│   │   ├── api.ts
│   │   └── storage.ts
│   └── types/                 # TypeScript data contracts
│       ├── booking.ts
│       ├── event.ts
│       └── user.ts
└── package.json
```

---

## 👨‍💻 Author

- **Rajithan Pathmanathan**
- Module: Cross-Platform Mobile Application Development
