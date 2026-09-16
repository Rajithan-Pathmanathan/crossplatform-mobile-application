# 🎟️ EventHub - Cross-Platform Event Discovery & Booking Mobile App

[![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo%20SDK-57.0.23-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey)]()

A premier, production-grade cross-platform mobile application developed with **React Native**, **Expo SDK 57**, and **TypeScript (Strict Mode)**. **EventHub** empowers attendees to discover, explore, bookmark, and book local experiences, while providing event organizers with an executive studio dashboard to publish events, manage capacities, track gross revenues, and review attendee sales analytics.

Developed for the **Cross-Platform Mobile Application Development** academic module.

---

## 📑 Table of Contents

- [Scenario \& Objectives](#-scenario--objectives)
- [Key Features](#-key-features)
  - [1. Authentication \& Role Switcher](#1-authentication--role-switcher)
  - [2. Event Discovery, Search \& Filtering](#2-event-discovery-search--filtering)
  - [3. Event Details \& Capacity Monitoring](#3-event-details--capacity-monitoring)
  - [4. Ticket Booking Engine \& Digital Passes](#4-ticket-booking-engine--digital-passes)
  - [5. My Bookings \& Atomic Seat Restitution](#5-my-bookings--atomic-seat-restitution)
  - [6. Organizer Studio, Publishing \& Sales Analytics](#6-organizer-studio-publishing--sales-analytics)
- [Assignment Requirements Compliance Matrix](#-assignment-requirements-compliance-matrix)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started \& Running Guide](#-getting-started--running-guide)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running on Android Emulator (Pixel 10)](#running-on-android-emulator-pixel-10)
  - [Running in Antigravity IDE](#running-in-antigravity-ide)
  - [Running on a Physical Device (Expo Go)](#running-on-a-physical-device-expo-go)
- [Demo Credentials](#-demo-credentials)
- [Data Storage \& Architecture](#-data-storage--architecture)
- [Author \& Credits](#-author--credits)

---

## 🎯 Scenario & Objectives

A company is planning to develop a mobile application called **EventHub** to help users discover and book events and activities available in their area.
- **For Attendees**: Browse diverse event categories, view rich event schedules and venues, reserve tickets with real-time price calculation, receive unique reference codes with scannable passes, and cancel bookings if plans change.
- **For Organizers**: Publish new events with curated photography presets, modify metadata (venues, schedules, pricing, capacity), safeguard events with confirmation modals, and inspect real-time sales performance and confirmed guestlists.

---

## ✨ Key Features

### 1. Authentication & Role Switcher
- **Live Validated Forms**: Email validation, minimum password length enforcement, and password match confirmation.
- **Role-Based Workflows**: Dynamically adapts the navigation tree and bottom tabs for **Attendee** vs. **Organizer**.
- **1-Tap Quick Demo Access**: Instant pre-filled login for quick examination and grading.
- **Profile Customization**: In-app avatar display, editable contact info, notification preference toggles, and safety logout dialog.
- **Session Persistence**: Authentication states saved across cold restarts using `@react-native-async-storage/async-storage`.

### 2. Event Discovery, Search & Filtering
- **Real-Time Search Bar**: Instant filtering against event titles, venues, and descriptions with clear action.
- **Horizontal Category Carousel**: Filter events by **All Events**, **Music**, **Tech & AI**, **Sports**, **Food & Drink**, and **Arts**.
- **Urgent Seat Badges**:
  - 🟢 `X seats available`
  - 🟡 `Only X seats left!` (urgent warning for $\le 15$ seats)
  - 🔴 `Sold Out` (booking disabled with clear visual feedback)
- **Interactive Event Cards**: Hero photography, category pills, date/time formatters, pricing badges, and favorite heart toggles.

### 3. Event Details & Capacity Monitoring
- **Immersive Full-Bleed Hero**: Back button navigation and persistent bookmark heart icon.
- **Schedule & Venue Cards**: Clean iconography and address details.
- **Verified Host Badge**: Displays organizing company or individual host profile.
- **Dynamic Capacity Meter**: Visual progress bar indicating percentage and count of claimed seats.
- **Sticky Booking Footer**: Shows ticket price and primary Call-To-Action.

### 4. Ticket Booking Engine & Digital Passes
- **Interactive Stepper Counter**: `-` / `+` selectors constrained by `min(8, availableSeats)`.
- **Dynamic Real-Time Price Engine**: Live calculation of Subtotal, Platform Fee ($0.00 Free), and Grand Total.
- **Pre-Populated Contact Form**: Automatically fills authenticated attendee's name and email, with custom notes input and terms checkbox.
- **Celebratory Confirmation Screen**: Verified pass layout with side cutout punches, dashed tear-off dividers, and unique reference codes (`EVT-XXXXX`).

### 5. My Bookings & Atomic Seat Restitution
- **Segmented Management Tabs**: **Active Passes** vs. **Past & Cancelled** with dynamic badge counters.
- **Digital Pass Viewer**: High-fidelity modal pop-up displaying attendee details and barcode representation.
- **Atomic Cancellation**: 1-tap cancellation safety prompt that immediately returns reserved seats back to the public capacity pool.

### 6. Organizer Studio, Publishing & Sales Analytics
- **Executive KPI Dashboard**: 4 real-time aggregated metrics:
  - 📅 **Total Events Hosted**
  - 🟢 **Active Events**
  - 🎟️ **Total Tickets Sold**
  - 💵 **Gross Revenue ($)**
- **Create & Edit Engine (`CreateEditEventScreen.tsx`)**:
  - Dual-mode workflow adapting seamlessly between creation and modification.
  - Category pill selection, schedule inputs, venue/address field, and numeric validations for price and capacity.
  - Curated preset photography gallery with 6 thematic covers (Concerts, Tech Summits, Food Festivals, Marathons, Masterclasses, Art Exhibitions) plus custom URL input.
- **Attendee Sales Analytics Modal (`EventAnalyticsModal.tsx`)**:
  - Real-time gross revenue and ticket conversion gauge.
  - Confirmed attendee guestlist with buyer emails, ticket quantities, reference codes, and transaction totals.
- **Safety Delete Modal**: Red warning dialog preventing accidental deletion, with instant removal from both Studio and Explore feeds.

---

## 📊 Assignment Requirements Compliance Matrix

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Cross-Platform Framework** | React Native with Expo SDK 57 and TypeScript | ✅ Complete |
| **User Authentication** | Login & Register screens with validation and demo access | ✅ Complete |
| **Role-Based Access** | Attendee mode & Organizer mode with role-aware tab navigation | ✅ Complete |
| **Event Discovery & Browsing** | Search bar, horizontal category filter pills, empty state handlers | ✅ Complete |
| **Event Details** | Hero banners, capacity bars, organizer badges, location/schedule | ✅ Complete |
| **Event Booking Engine** | Interactive quantity counter, price calculator, attendee form | ✅ Complete |
| **Booking Management** | Active vs Past tabs, digital ticket passes, unique reference codes | ✅ Complete |
| **Cancellation & Refund** | Cancellation modal with atomic seat restitution back to inventory | ✅ Complete |
| **Organizer Dashboard** | Executive KPI metric cards, event management list with revenue/capacity | ✅ Complete |
| **Event Publishing & Editing** | Dual-mode screen with category chips, validation, and preset cover gallery | ✅ Complete |
| **Sales & Attendee Analytics** | Detailed modal showing revenue, sold tickets, and verified attendee roster | ✅ Complete |
| **Safe Deletion** | Warning confirmation dialog with immediate feed synchronization | ✅ Complete |
| **Data Persistence** | AsyncStorage service layer simulating REST API with realistic latency | ✅ Complete |

---

## 🛠️ Technology Stack

- **Core Framework**: [React Native](https://reactnative.dev/) `0.86.3`
- **Development Tooling**: [Expo SDK](https://expo.dev/) `~57.0.23`
- **Language**: [TypeScript](https://www.typescriptlang.org/) `~6.0.3`
- **Routing & Navigation**: [React Navigation](https://reactnavigation.org/) `v7`
  - `@react-navigation/native`
  - `@react-navigation/native-stack`
  - `@react-navigation/bottom-tabs`
- **State & Storage**:
  - React Context API (`AuthContext`)
  - [`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/) `2.2.0`
- **Icons & UI Utilities**:
  - `@expo/vector-icons` (Ionicons & FontAwesome)
  - `react-native-safe-area-context`
  - `react-native-screens`
- **Build & Compilers**:
  - Babel with `babel-preset-expo` `~57.0.12`
  - `@react-native/codegen` `0.86.3` (deduplicated)

---

## 📂 Project Directory Structure

```
eventhub/
├── assets/                     # App splash, icon, and adaptive icons
├── src/
│   ├── components/             # Modular reusable UI components
│   │   ├── CategoryChipBar.tsx # Horizontal category selector
│   │   ├── EmptyState.tsx      # High-fidelity empty state indicator
│   │   ├── EventAnalyticsModal.tsx # Organizer revenue & guestlist analytics
│   │   ├── EventCard.tsx       # Discovery feed event card with badges & hearts
│   │   ├── SearchBar.tsx       # Live search bar with clear button
│   │   └── TicketPassModal.tsx # Digital ticket pass with cutouts & barcode
│   ├── constants/              # Centralized theme tokens & mock database
│   │   ├── categories.ts       # Supported event categories & icons
│   │   ├── colors.ts           # Curated modern HSL/Hex color palette
│   │   └── mockData.ts         # Pre-seeded events and user fixtures
│   ├── context/                # Global React Context providers
│   │   └── AuthContext.tsx     # Authentication state & role switching
│   ├── navigation/             # Navigation architecture & TypeScript types
│   │   ├── MainTabNavigator.tsx# Role-aware bottom tab navigator
│   │   ├── RootNavigator.tsx   # Stack router (Auth, Details, Booking, Studio)
│   │   └── types.ts            # Strongly typed route parameter contracts
│   ├── screens/                # Application screen modules
│   │   ├── auth/               # LoginScreen & RegisterScreen
│   │   ├── booking/            # BookingScreen & BookingConfirmationScreen
│   │   ├── bookings/           # MyBookingsScreen (Active vs Past passes)
│   │   ├── explore/            # ExploreScreen & EventDetailsScreen
│   │   ├── favorites/          # FavoritesScreen (Bookmarked events)
│   │   ├── organizer/          # OrganizerDashboardScreen & CreateEditEventScreen
│   │   └── profile/            # ProfileScreen & EditProfileModal
│   ├── services/               # Data layer & asynchronous services
│   │   ├── api.ts              # Simulated REST API layer (latency, CRUD, seat inventory)
│   │   └── storage.ts          # AsyncStorage helper for persistent cache
│   └── types/                  # TypeScript interface contracts
│       ├── booking.ts          # Booking, BookingRequest, BookingStatus
│       ├── event.ts            # Event, EventCategory, PresetImage
│       └── user.ts             # User, UserRole, AuthCredentials
├── App.tsx                     # Root application bootstrap & safe area provider
├── app.json                    # Expo application manifest configuration
├── babel.config.js             # Babel preset configuration
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript strict compilation settings
```

---

## 🚀 Getting Started & Running Guide

### Prerequisites
- **Node.js**: v18 or higher ([Download Node.js](https://nodejs.org/))
- **Package Manager**: `npm` (bundled with Node)
- **Virtual Device / Physical Phone**:
  - Android Studio with an active Virtual Device (e.g., **Pixel 10**, API 35/36)
  - *OR* a physical iOS/Android phone with **Expo Go** installed.

---

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

   *(Note: If opening inside the full academic workspace folder, navigate into `eventhub/` prior to running `npm install`)*


---

### Running on Android Emulator (Pixel 10)

1. Launch your **Pixel 10** emulator in Android Studio Device Manager (or run):
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_10
   ```
2. Start the application:
   ```bash
   npm run android
   ```
   *(or `npx expo start --android`)*
3. Expo will automatically install Expo Go (if not present) and stream the bundle directly to your emulator.

---

### Running in Antigravity IDE

1. Open the project in **Antigravity IDE**.
2. Open the integrated terminal (<kbd>Ctrl</kbd> + <kbd>`</kbd>).
3. Ensure you are in the `eventhub` folder:
   ```powershell
   cd eventhub
   npm run android
   ```
4. **Terminal Shortcuts**:
   - Press <kbd>a</kbd> ➔ Open / reconnect on Android emulator
   - Press <kbd>r</kbd> ➔ Reload JavaScript bundle
   - Press <kbd>m</kbd> ➔ Toggle Expo Developer Menu
   - Press <kbd>c</kbd> ➔ Clear terminal console

---

### Running on a Physical Device (Expo Go)

1. Connect your phone and computer to the **same Wi-Fi network**.
2. Start Expo in your terminal:
   ```bash
   npx expo start
   ```
3. A large QR code will appear in the terminal:
   - **Android**: Open the **Expo Go** app and select **"Scan QR Code"**.
   - **iOS**: Open the native **Camera app** and point it at the QR code.
4. The application will bundle and open instantly on your handset.

---

## 🔑 Demo Credentials

To streamline evaluation and testing, you can use the **1-Tap Quick Login** buttons on the login screen or enter:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Attendee** | `attendee@eventhub.com` | `password123` | Discover events, book tickets, view passes, cancel bookings |
| **Organizer** | `organizer@eventhub.com` | `password123` | Studio dashboard, publish events, edit metadata, sales analytics |

---

## 💾 Data Storage & Architecture

- **Simulated REST Service ([`src/services/api.ts`](src/services/api.ts))**:
  - Implements realistic network delay (300ms–500ms) to model real-world loading states.
  - Implements seat concurrency checks to prevent overselling beyond venue capacity.
  - Generates immutable booking reference numbers (`EVT-XXXXX`).
- **AsyncStorage Layer ([`src/services/storage.ts`](src/services/storage.ts))**:
  - Persists authenticated user sessions across app launches.
  - Keeps offline bookmarks and favorites synchronized.
  - Stores all published, updated, and deleted events locally.

---

## 👨‍💻 Author & Credits

- **Developer**: [Rajithan Pathmanathan](https://github.com/Rajithan-Pathmanathan)
- **Academic Module**: Cross-Platform Mobile Application Development (Year 02, Semester 02)
- **Framework**: React Native & Expo
- **Repository**: [crossplatform-mobile-application](https://github.com/Rajithan-Pathmanathan/crossplatform-mobile-application.git)
