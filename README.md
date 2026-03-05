# DentiSyn - Dental Practice Management Software

> A professional, localized web application for dental clinics featuring Dark Mode, Multi-Language support, Smart Scheduling, and fully responsive mobile/tablet design.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

---

## 📋 Description

**DentiSyn** is a modern, framework-free dental practice management system built specifically for Bulgarian dental clinics. The application combines intuitive design with powerful features to streamline appointment scheduling, patient management, and clinic operations.

### Why DentiSyn?

- **🌍 Localized for Bulgaria**: Full support for Bulgarian EGN (ЕГН) and LNCh (ЛНЧ) ID validation with accurate sex extraction
- **📱 Mobile-First Design**: Fully responsive with optimized mobile/tablet navigation and layouts
- **🌓 Dark Mode**: Eye-friendly interface with automatic theme switching
- **🌐 Multi-Language**: Seamless switching between English and Bulgarian
- **📅 Smart Scheduling**: Intelligent appointment management with resource allocation
- **💾 No Backend Required**: All data stored locally using modern browser APIs

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Vite** | Build tool & dev server | 7.2.4 |
| **TypeScript** | Type-safe vanilla JavaScript | 5.9.3 |
| **Bootstrap 5.3** | UI framework & Dark Mode | 5.3.8 |
| **FullCalendar** | Appointment scheduling | Latest |
| **i18next** | Internationalization (i18n) | Latest |
| **Zod** | Runtime validation | 4.3.6 |
| **Vitest** | Unit testing | 4.0.18 |
| **Playwright** | End-to-end testing | 1.58.1 |

### Architecture Choice

Built with **Vanilla TypeScript** (no framework) for:
- ✅ Lightning-fast performance
- ✅ Zero framework overhead
- ✅ Complete control over DOM
- ✅ Easy maintenance and debugging

---

## ✨ Key Features

### 🎯 Smart Appointment Modal
- **Auto-detection**: Recognizes Bulgarian EGN (10 digits) vs LNCh (10 digits) via checksum validation
- **ID Validation**: Real-time validation with accurate checksum algorithms
- **Auto-fill Intelligence**: Extracts Date of Birth and Sex from EGN (even digit = male, odd digit = female)
- **Error Handling**: Clear validation messages in both languages
- **Foreign ID Support**: Handles passports and international identification

### 📆 Resource Calendar
- **15-Minute Time Slots**: Precision scheduling with customizable intervals
- **Doctor Filtering**: Multi-resource view with individual doctor calendars
- **Working Hours Logic**: Automatically enforces clinic operating hours
- **Drag & Drop**: Intuitive appointment rescheduling
- **Color Coding**: Visual status indicators (Confirmed, Cancelled, Completed)

### 👥 Patient Queue Dashboard
- **Live Status Tracking**: Real-time patient flow management
- **Triage System**: Waiting → Seated → Completed workflow
- **Next Patient Display**: Prominent card for upcoming appointment
- **Quick Stats**: At-a-glance metrics for daily operations

### ⚙️ Settings Engine
- **Modern UI Design**: 2026-style card layouts with gradient headers and subtle shadows
- **Responsive Layout**: Mobile-optimized with right-side dropdown positioning on small screens
- **Custom Clinic Hours**: Configure start/end times per doctor with visual schedule cards
- **Time Format Toggle**: 12-hour vs 24-hour display preference
- **LocalStorage Persistence**: All settings saved automatically
- **Compact Actions**: Small, clearly labeled Save/Discard buttons

### 🌐 Additional Features
- **Fully Responsive Design**: Mobile-first approach with right-aligned navigation on small screens
- **Smart Dropdown Menus**: Settings submenu opens on the right side to stay visible on mobile/tablet
- **Unified User Menu**: Language toggle and Dark Mode integrated into user dropdown
- **Toast Notifications**: Non-intrusive feedback system
- **Data Validation**: Zod schemas ensure data integrity
- **Comprehensive Test Coverage**: 48 passing unit tests + 5 E2E tests

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd my-dental-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript compilation + production build
npm run preview  # Preview production build locally
npm test         # Run Vitest unit tests
npm run test:e2e # Run Playwright end-to-end tests
```

---

## 📁 Folder Structure

```
my-dental-app/
├── src/
│   ├── components/           # UI Components (TypeScript modules)
│   │   ├── appointment/      # Appointment modal (refactored into modules)
│   │   │   ├── AppointmentModal.ts         # Main orchestrator
│   │   │   ├── renderAppointmentModal.ts   # HTML template
│   │   │   ├── patientHandlers.ts          # Patient search & ID validation
│   │   │   ├── appointmentFormHandlers.ts  # Form validation & save logic
│   │   │   ├── doctorUtils.ts              # Doctor availability
│   │   │   ├── timeUtils.ts                # Time generation utilities
│   │   │   └── constants.ts                # Shared constants
│   │   ├── calendar/         # Calendar view & scheduling
│   │   │   └── CalendarLogic/ # Event handlers, modals, refresh
│   │   ├── dashboard/        # Patient queue & stats
│   │   ├── layout/           # Navbar & shell components
│   │   └── user/             # User settings & preferences
│   │       └── Settings/
│   │           └── CalendarSettings/
│   ├── locales/              # i18n translation files
│   │   ├── en.json           # English translations
│   │   └── bg.json           # Bulgarian translations
│   ├── repositories/         # Data access layer
│   │   ├── appointmentRepository.ts
│   │   └── patientRepository.ts
│   ├── types/                # TypeScript type definitions
│   │   └── patient.ts
│   ├── utils/                # Helper functions
│   │   ├── bgUtils.ts        # EGN/LNCh validation
│   │   └── toast.ts          # Notification system
│   ├── i18n.ts               # i18next configuration
│   ├── main.ts               # Application entry point
│   └── style.css             # Global styles
├── tests/                    # Test suites
│   ├── bgUtils.test.ts       # Unit tests for ID validation
│   ├── calendar.e2e.spec.ts  # E2E calendar tests
│   └── components.test.ts    # Component unit tests
├── public/                   # Static assets
├── index.html                # HTML entry point
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── vitest.config.ts          # Vitest test configuration
└── playwright.config.ts      # Playwright E2E configuration
```

### Architecture Highlights

- **Component-Based**: Modular TypeScript classes for UI components
- **Modular Design**: Large components split into focused, single-responsibility modules
- **Repository Pattern**: Clean separation of data access logic
- **Type Safety**: Comprehensive TypeScript types and Zod schemas
- **i18n Ready**: Centralized translation files for easy localization
- **Test-Driven**: Co-located tests with comprehensive coverage
- **Maintainable**: Clear separation of concerns with files under 250 lines

---

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test
```
Tests critical business logic like EGN validation, date calculations, and utilities.

### E2E Tests (Playwright)
```bash
npm run test:e2e
```
Tests user workflows including appointment booking, calendar interactions, and settings management.

---

## 🌍 Localization

The app supports:
- **English (en)**: Default language
- **Bulgarian (bg)**: Full translation including form validation messages

Switch languages via the navbar toggle. All settings and preferences persist across sessions.

---

## 🔒 Data Storage

- **LocalStorage**: All patient records, appointments, and settings
- **No External Dependencies**: Fully offline-capable
- **Privacy First**: No data leaves the user's device
- **Export Ready**: Data structure designed for future cloud sync

---

## 🎨 Customization

### Theme
Bootstrap 5.3's Dark Mode is implemented via `data-bs-theme` attribute. Toggle in Settings panel.

### Clinic Hours
Configure custom operating hours in Settings → Calendar Settings.

### Time Format
Switch between 12-hour (AM/PM) and 24-hour format in Settings.

---

## 🆕 Recent Updates (v0.1.0)

### Calendar & Patient Integration (March 2026)
- ✅ **Interactive Event Tooltips**: Clicking patient names in calendar popups navigates directly to their detailed Patient Carton.
- ✅ **Quick Appointment History**: A dedicated history button next to the patient's name instantly loads a high-fidelity **slide-in panel from the right side of the screen**, showing past and upcoming appointments in a timeline interface with enhanced typography, visual feedback, and color-coded status elements.
- ✅ **Upgraded Unconfirmed Tab**: Redesigned layout grouping patient names, phone numbers, and doctors around the confirmation button for faster triaging.

### Code Refactoring & Maintainability (February 2026)
- ✅ **AppointmentModal Refactored**: Split 778-line monolith into 7 focused modules
  - `renderAppointmentModal.ts` - HTML template generation
  - `patientHandlers.ts` - Patient search, selection, and ID validation
  - `appointmentFormHandlers.ts` - Form validation and save logic
  - `doctorUtils.ts` - Doctor availability calculations
  - `timeUtils.ts` - Time generation utilities
  - `constants.ts` - Shared constants (country codes)
  - `AppointmentModal.ts` - Main orchestrator (110 lines)
- ✅ **Improved Testability**: Each module can now be tested independently
- ✅ **Zero Breaking Changes**: All existing imports continue to work
- ✅ **Better Organization**: Clear separation of concerns and single responsibility

### Mobile & Tablet Improvements
- ✅ Right-aligned navigation items on mobile view
- ✅ Settings submenu now opens on the right side to prevent off-screen issues
- ✅ Language and Dark Mode toggles moved to User dropdown for cleaner UI

### Calendar Settings Redesign
- ✅ Modernized 2026-style design with gradient card headers
- ✅ Compact action buttons (Save/Discard) with icons
- ✅ Improved responsive layout for mobile/tablet devices
- ✅ Visual schedule cards with better spacing and shadows

### EGN Validation Fix
- ✅ Corrected sex extraction logic (even digit = male, odd digit = female)
- ✅ Updated all tests and documentation to match Bulgarian ID standards
- ✅ Enhanced validation feedback in appointment modal

---

## 🛣️ Roadmap

- [ ] Cloud sync with Puter.js integration
- [ ] Patient medical history tracking
- [src/components/appointment/REFACTORING_SUMMARY.md](./src/components/appointment/REFACTORING_SUMMARY.md) - AppointmentModal refactoring details
- [ ] Invoice generation and billing
- [ ] SMS appointment reminders
- [ ] Multi-clinic support
- [ ] Advanced reporting and analytics

---

## 📝 Documentation Files

- [BULGARIAN_ID_VALIDATION.md](./BULGARIAN_ID_VALIDATION.md) - EGN/LNCh validation logic
- [APPOINTMENT_SYSTEM_FIX_SUMMARY.md](./APPOINTMENT_SYSTEM_FIX_SUMMARY.md) - Calendar implementation notes
- [SMART_FEATURES.md](./SMART_FEATURES.md) - Detailed feature documentation
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing strategy and examples

---

## 🤝 Contributing

This is a private project. For internal team members:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📄 License

Private - All rights reserved

---

## 🙏 Acknowledgments

- Bootstrap team for the excellent UI framework
- FullCalendar for robust scheduling components
- i18next for seamless internationalization
- The TypeScript community for comprehensive tooling

---

## 📞 Support

For questions or issues, please contact the development team or open an issue in the repository.

---

**Built with ❤️ for Bulgarian Dental Professionals**
