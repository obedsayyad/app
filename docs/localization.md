# Localization Documentation - English Setup

## Overview

This document outlines the localization architecture for the macOS VPN app, which follows Outline's proven native Cordova/Swift architecture. Currently configured for **English (US) only** to optimize performance and simplify development.

## Localization Architecture

Our app uses a two-tier localization system:

1. **Native AppKit Strings**: For status bar, system menus, and native macOS integration
2. **Web UI Messages**: For the React-based user interface (replacing Cordova web UI)

## File Structure

```
src/
├── cordova/apple/xcode/Outline/Classes/AppKitBridge/Resources/Strings/
│   └── en.lproj/
│       └── Localizable.strings          # Native AppKit strings
└── www/messages/
    └── en.json                          # Web UI messages for React
```

## Native AppKit Localization

### Location

`src/cordova/apple/xcode/Outline/Classes/AppKitBridge/Resources/Strings/en.lproj/Localizable.strings`

### Current Strings

```strings
"tray_open_window" = "Open";
"quit" = "Quit";
"disconnect" = "Disconnect";
"connect" = "Connect";
```

### Usage in Swift Code

```swift
// Access localized strings in AppKitController.swift or StatusItemController.swift
NSLocalizedString("tray_open_window", comment: "Open window menu item")
NSLocalizedString("connect", comment: "Connect to VPN")
NSLocalizedString("disconnect", comment: "Disconnect from VPN")
NSLocalizedString("quit", comment: "Quit application")
```

### Xcode Integration

- Strings are properly integrated into the `AppKitIntegration.framework`
- Included in build phases as resources
- English is set as the development language in `knownRegions`

## Web UI Messages

### Location

`src/www/messages/en.json`

### Structure

JSON format with key-value pairs for all UI text:

```json
{
  "connect-button-label": "Connect",
  "disconnect-button-label": "Disconnect",
  "about-page-title": "About",
  "error-invalid-access-key": "Invalid access key. Please try again, or submit feedback for help."
}
```

### Usage in React Components

```javascript
// Import the English messages
import messages from "../messages/en.json";

// Use in components
const connectLabel = messages["connect-button-label"];
const aboutTitle = messages["about-page-title"];
```

## Key Localization Categories

### Native AppKit (System Integration)

- **Status Bar**: Tray menu items and tooltips
- **System Menus**: Application menu, context menus
- **System Dialogs**: Native macOS alert dialogs
- **Accessibility**: VoiceOver and accessibility strings

### Web UI (React Interface)

- **Main Interface**: Buttons, labels, navigation
- **Server Management**: Adding, connecting, managing servers
- **Error Messages**: Connection errors, validation messages
- **Dialogs**: Confirmation dialogs, input forms
- **Settings**: Preferences, appearance, language options
- **Support**: Help text, contact forms, feedback

## Development Guidelines

### Adding New Native Strings

1. Add to `Localizable.strings`:

```strings
"new_menu_item" = "New Menu Item";
```

2. Use in Swift code:

```swift
let menuTitle = NSLocalizedString("new_menu_item", comment: "Description of the string")
```

### Adding New Web UI Messages

1. Add to `en.json`:

```json
{
  "new-ui-element": "New UI Element Text"
}
```

2. Use in React:

```javascript
const text = messages["new-ui-element"];
```

### String Key Conventions

#### Native AppKit

- Use `snake_case`
- Descriptive of the UI element: `tray_open_window`, `menu_preferences`
- Keep comments descriptive for context

#### Web UI Messages

- Use `kebab-case`
- Hierarchical structure: `error-connection-proxy`, `server-add-instructions`
- Match the original Outline conventions

## Build Integration

### Xcode Project Settings

- Localization properly configured in `project.pbxproj`
- English set as development region
- Localizable.strings included in AppKitIntegration framework
- Resources copied during build process

### React Build

- Messages JSON files loaded as modules
- No build-time processing required for single language
- Direct import and usage in components

## Performance Considerations

### English-Only Benefits

- **Reduced Bundle Size**: No multiple language files
- **Faster Load Times**: No language detection/switching logic
- **Simplified Logic**: No pluralization or complex formatting rules
- **Development Speed**: Single source of truth for all text

### Future Multi-Language Support

If multi-language support is needed later:

1. **Native Side**: Add additional `.lproj` folders
2. **Web Side**: Create additional JSON files (e.g., `es.json`, `fr.json`)
3. **Logic**: Implement language detection and switching
4. **Build**: Update build process for multiple languages

## Testing Localization

### Native Strings

```bash
# Build and test AppKitIntegration framework
xcodebuild -scheme AppKitIntegration -destination 'platform=macOS'
```

### Web UI Messages

```bash
# Validate JSON format
node -e "console.log(JSON.parse(require('fs').readFileSync('src/www/messages/en.json')))"
```

## File Maintenance

### Consistency Checks

- Ensure all UI text uses localized strings (no hardcoded text)
- Verify string keys match between code and resource files
- Check for unused strings during cleanup

### Version Control

- Track changes to both `.strings` and `.json` files
- Include context in commit messages when modifying strings
- Review string changes for consistency and tone

## Integration with React UI Replacement

When replacing the Cordova web UI with React:

1. **Import Messages**: `import messages from './messages/en.json'`
2. **Create Hook**: Consider a `useMessages()` hook for consistent access
3. **Component Props**: Pass messages as props to maintain testability
4. **Error Boundaries**: Ensure graceful fallback for missing strings

## Troubleshooting

### Common Issues

1. **Missing Strings**: Check file paths and build phases
2. **Xcode Not Finding Strings**: Verify `.lproj` folder structure
3. **JSON Parse Errors**: Validate JSON syntax
4. **Runtime Errors**: Ensure string keys exist before access

### Debug Commands

```bash
# Check Xcode project for localization settings
grep -r "Localizable.strings" src/cordova/apple/xcode/

# Validate JSON files
find src/www/messages -name "*.json" -exec node -c {} \;
```

This localization setup provides a solid foundation for the English-only macOS VPN app while maintaining flexibility for future expansion.
