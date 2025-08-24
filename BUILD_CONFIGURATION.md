# TeachGate VPN macOS Build Configuration

## Overview

This document outlines the build targets and schemes configuration for the TeachGate VPN macOS application after updating from the original Outline VPN codebase.

## Build Targets

### 1. Main Application Target

- **Target Name**: Outline (configured as "TeachGate VPN" in scheme)
- **Bundle ID**:
  - iOS: `com.teachgate.vpn.ios`
  - macOS: `com.teachgate.vpn.macos`
- **Product Name**: `TeachGate VPN.app` (in scheme configuration)
- **Deployment Target**: macOS 12.0+, iOS 15.5+
- **Architecture**: Universal (Apple Silicon + Intel for macOS)

### 2. AppKit Integration Target

- **Target Name**: AppKitIntegration
- **Bundle ID**: `com.teachgate.vpn.macos.appkit`
- **Product Type**: Framework
- **Purpose**: macOS-specific AppKit bridge functionality
- **Deployment Target**: macOS 12.0+

### 3. VPN Network Extension Target

- **Target Name**: VpnExtension (external reference)
- **Bundle ID**:
  - iOS: `com.teachgate.vpn.ios.extension`
  - macOS: `com.teachgate.vpn.macos.extension`
- **Product Type**: Network Extension (.appex)
- **Purpose**: Handles VPN network traffic processing
- **Embedded in**: Main Application
- **Test Target**: VpnExtensionTest

## Build Schemes

### Primary Schemes

#### 1. TeachGate VPN.xcscheme (Main App Scheme)

- **Former Name**: Outline.xcscheme
- **Purpose**: Builds and runs the main TeachGate VPN application
- **Build Configuration**: Debug and Release
- **Target Dependencies**:
  - AppKitIntegration
  - CocoaLumberjack
  - CocoaLumberjackSwift
  - Sentry
- **Build Actions**: All enabled (Testing, Running, Profiling, Archiving, Analyzing)

#### 2. VpnExtension.xcscheme (Extension Scheme)

- **Purpose**: Builds and tests the VPN network extension
- **Build Configuration**: Debug and Release
- **Special Configuration**:
  - `wasCreatedForAppExtension = "YES"`
  - `askForAppToLaunch = "Yes"` (requires host app selection)
  - `launchAutomaticallySubstyle = "2"` (extension launch mode)

#### 3. AppKitIntegration.xcscheme (Framework Scheme)

- **Purpose**: Builds the AppKit integration framework
- **Build Configuration**: Debug and Release

## Build Configuration Settings

### Deployment Targets

- **macOS**: 12.0 (minimum supported version)
- **iOS**: 15.5 (minimum supported version for Mac Catalyst)

### Architecture Support

- **macOS**: arm64, x86_64 (Universal Binary)
- **iOS**: arm64

### Package Dependencies

- **CocoaLumberjack**: 3.9.0 (Logging framework)
- **Sentry**: 8.55.0 (Crash reporting and analytics)
- **swift-log**: 1.6.4 (Swift logging API)

## Development Workflow

### Building the Application

1. **Clean Build First** (Important for code signing)

   ```bash
   cd src/cordova/apple/xcode
   xcodebuild -scheme "TeachGate VPN" -configuration Debug clean
   ```

2. **Build for Development**

   ```bash
   xcodebuild -scheme "TeachGate VPN" -configuration Debug build
   ```

3. **Build for Release**
   ```bash
   xcodebuild -scheme "TeachGate VPN" -configuration Release build
   ```

### Building VPN Extension

```bash
xcodebuild -scheme "VpnExtension" -configuration Debug build
```

### Listing Available Schemes

```bash
xcodebuild -list -project Outline.xcodeproj
```

## Code Signing Configuration

### Requirements

- **Apple Developer Account**: Required for VPN app development
- **Team ID**: Must be configured in project settings
- **Provisioning Profiles**: Required for both main app and network extension
- **Entitlements**: Network extension entitlements must be properly configured

### Bundle ID Requirements

- Main app and network extension must use related bundle IDs
- Network extension bundle ID must be a child of the main app bundle ID
- Example:
  - Main app: `com.teachgate.vpn.macos`
  - Extension: `com.teachgate.vpn.macos.extension`

## Known Build Issues and Solutions

### 1. Missing Configuration Files

**Error**: `Unable to open base configuration reference file 'cordova/build.xcconfig'`
**Solution**: Ensure Cordova configuration files are present or configure build settings directly in Xcode

### 2. Provisioning Profile Issues

**Error**: `No profiles for 'com.teachgate.vpn.macos' were found`
**Solution**:

- Set up proper Apple Developer account
- Configure automatic or manual code signing
- Generate provisioning profiles for VPN app development

### 3. Missing Package Dependencies

**Error**: `Missing package product 'OutlineAppleLib'`
**Solution**: Ensure all Swift Package Manager dependencies are resolved

## Project Structure

```
src/cordova/apple/xcode/
├── Outline.xcodeproj/
│   ├── project.pbxproj (main project configuration)
│   └── xcshareddata/
│       └── xcschemes/
│           ├── TeachGate VPN.xcscheme (main app scheme)
│           ├── VpnExtension.xcscheme (extension scheme)
│           └── AppKitIntegration.xcscheme (framework scheme)
├── Outline/ (main app source code)
└── cordova/ (configuration files - may need setup)
```

## External Dependencies

### Swift Packages (via Package.swift)

- **OutlineAppleLib**: Custom Swift package for Apple platform integration
- **OutlineTunnel**: VPN tunnel implementation

### Xcode Project References

- **OutlineLib.xcodeproj**: Contains VPN extension implementation
- **Package dependencies**: Managed via Swift Package Manager

## Next Steps for Developers

1. **Set up Apple Developer Account** with VPN development capabilities
2. **Configure code signing** for both main app and network extension targets
3. **Set up build environment** with required Cordova configuration files
4. **Test build process** in Xcode with proper provisioning profiles
5. **Verify VPN functionality** with proper entitlements and certificates

## Troubleshooting

### Scheme Not Found Error

If you encounter "scheme not found" errors, verify:

- Scheme file exists in `xcshareddata/xcschemes/`
- Scheme name matches exactly (case-sensitive)
- Project file is not corrupted

### Build Configuration Issues

- Ensure all bundle IDs follow Apple's requirements
- Verify deployment targets are compatible
- Check that all required frameworks and dependencies are linked

---

**Last Updated**: August 2025  
**Project Version**: TeachGate VPN v1.0  
**Xcode Version**: 15.0+ recommended  
**macOS Target**: 12.0+
