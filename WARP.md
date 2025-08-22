# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TuEspacio is a React Native mobile application built with Expo. This is a cross-platform mobile app that can run on iOS, Android, and web platforms.

**Tech Stack:**
- React Native 0.79.5
- Expo ~53.0.20
- React 19.0.0
- Babel for transpilation

## Common Development Commands

### Development Server
```bash
# Start the Expo development server
npm start

# Start with specific platform
npm run android    # Open on Android device/emulator
npm run ios        # Open on iOS simulator
npm run web        # Open in web browser
```

### Package Management
```bash
# Install dependencies
npm install

# Install new packages (use expo install for Expo-compatible versions)
expo install <package-name>

# Check for outdated packages
npm outdated
```

### Build and Deploy
```bash
# Build for production (requires Expo CLI)
expo build:android
expo build:ios
expo build:web

# Create development build
expo run:android
expo run:ios
```

### Development Tools
```bash
# Clear Expo cache (useful for troubleshooting)
expo start --clear

# Check Expo diagnostics
expo doctor

# View logs
expo logs --type=device
```

## Project Architecture

### File Structure
This is a basic Expo React Native project with the following key files:
- `App.js` - Main application component and entry point
- `index.js` - Root component registration with Expo
- `app.json` - Expo configuration (app metadata, build settings, platform-specific configs)
- `package.json` - Dependencies and npm scripts

### Entry Points
- **Main Entry:** `index.js` registers the App component with Expo
- **App Component:** `App.js` contains the main application logic
- **Platform Support:** Configured for iOS, Android, and web via `app.json`

### Development Setup
- **New Architecture:** Enabled in `app.json` (`newArchEnabled: true`)
- **Edge-to-Edge:** Android edge-to-edge display enabled
- **Orientation:** Portrait mode enforced
- **Assets:** Icons and splash screens in `assets/` directory

### Key Configuration
- **App Name:** TuEspacio
- **Bundle ID:** Uses slug "TuEspacio"
- **Version:** 1.0.0
- **UI Style:** Light mode only
- **Platforms:** iOS (tablet support), Android (adaptive icon), Web (favicon)

## Development Notes

This appears to be a fresh Expo project with minimal customization. The main App.js still contains the default Expo starter template. When developing:

1. Start with `npm start` to run the Expo development server
2. Use Expo Go app on mobile devices for quick testing
3. The project uses the new React Native architecture
4. All platform-specific configurations are managed through `app.json`
