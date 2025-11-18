# Artful Agenda Mobile App Explanation

## Overview

The mobile version of Artful Agenda is designed as a personal productivity and calendar management application with unique features like custom stickers, voice input, and geofencing reminders.

## Main Sections

### 1. Events Section (📅)

- View and manage your calendar events
- Add new events using the "+" button
- Capture photos with the camera button (📷) to attach to events
- Use voice input (🎤) to create events by speaking
- Get location-based reminders with the location button (📍)

### 2. Tasks Section (✅)

- Manage your to-do list and tasks
- Add new tasks with the "+" button
- Enable/disable notifications for task reminders (🔔/🔕)
- Set up geofence alerts (📍) that trigger when you enter/leave specific locations

### 3. Stickers Section (💠)

- View your collection of decorative stickers
- Create custom stickers from photos:
  1. Tap the "+" button to open the camera
  2. Take a photo
  3. Preview and save the photo as a custom sticker
- Toggle between light/dark mode (☀️/🌙) and OLED mode for better visibility

## Bottom Navigation

The bottom navigation bar allows you to switch between the main sections:

- 📅 Calendar/Events
- ✅ Tasks
- 💠 Stickers
- 📊 Analytics (not yet implemented)
- ⚙️ Settings (not yet implemented)

## Key Features

### Biometric Authentication

- Secure login using fingerprint or face recognition

### Camera Integration

- Take photos directly in the app to attach to events or create stickers

### Voice Input

- Create events by speaking instead of typing

### Location Services

- Get location-based reminders
- Set up geofences for location-triggered notifications

### Dark Mode

- Switch between light and dark themes for comfortable viewing
- Special OLED mode for devices with OLED screens

### Offline Support

- Works even when you don't have internet connection
- Automatically syncs when connection is restored

## How to Use

1. **Login**: Use biometric authentication to access the app
2. **Navigate**: Use the bottom navigation bar or top tabs to switch sections
3. **Add Content**:
   - Events: Use camera, voice, or manual entry
   - Tasks: Add with the "+" button
   - Stickers: Create from photos using the "+" button
4. **Customize**: Adjust settings like dark mode and notifications

## Technical Details

The app is built with React and TypeScript, using modern mobile-first design principles. It includes:

- Real-time synchronization capabilities
- Local storage for offline access
- Camera and location service integration
- Gesture recognition for enhanced interaction
- Push notification support
