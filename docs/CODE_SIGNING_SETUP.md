# Code Signing Setup for macOS VPN App

This document provides comprehensive instructions for setting up code signing certificates and provisioning profiles for the macOS VPN app. This setup is required for both development and distribution builds.

## Overview

The macOS VPN app consists of three main components that require code signing:

1. **Main App** (`org.outline.macos.client`) - The primary application
2. **VPN Network Extension** (`org.outline.macos.client.VpnExtension`) - The packet tunnel provider
3. **AppKit Framework** (`org.outline.macos.client.AppKitIntegration`) - Mac-specific UI components

## Prerequisites

- **Apple Developer Account** (Individual or Organization)
- **Xcode 15.2+** installed
- **Xcode Command Line Tools**: `xcode-select --install`
- **macOS 12.0+** for development

## Apple Developer Account Setup

### 1. Register App Identifiers

You need to register unique app identifiers in your Apple Developer Portal:

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles** → **Identifiers**
3. Create the following App IDs:

#### Main App Identifier

- **Description**: macOS VPN Client
- **Bundle ID**: `com.yourcompany.macos.vpnclient` (replace with your domain)
- **Capabilities**:
  - App Groups
  - Network Extensions

#### VPN Extension Identifier

- **Description**: macOS VPN Network Extension
- **Bundle ID**: `com.yourcompany.macos.vpnclient.VpnExtension`
- **Capabilities**:
  - App Groups (same group as main app)
  - Network Extensions
  - Personal VPN

#### AppKit Framework Identifier

- **Description**: macOS VPN AppKit Integration
- **Bundle ID**: `com.yourcompany.macos.vpnclient.AppKitIntegration`

### 2. Create App Groups

VPN Network Extensions require App Groups for communication between the main app and extension:

1. In Apple Developer Portal, go to **Identifiers** → **App Groups**
2. Create a new App Group:
   - **Identifier**: `group.com.yourcompany.vpnclient`
   - **Description**: VPN Client App Group

### 3. Generate Certificates

#### Development Certificate

1. Go to **Certificates** → **Development**
2. Create **Apple Development** certificate
3. Download and install in Keychain Access

#### Distribution Certificate (for App Store/Ad Hoc)

1. Go to **Certificates** → **Production**
2. Create **Mac App Distribution** certificate
3. Download and install in Keychain Access

### 4. Create Provisioning Profiles

#### Development Profiles

Create development provisioning profiles for each target:

1. **Main App Development Profile**

   - Type: Mac Development
   - App ID: Your main app identifier
   - Certificates: Select your development certificate
   - Devices: Select your development Macs

2. **VPN Extension Development Profile**

   - Type: Mac Development
   - App ID: Your VPN extension identifier
   - Certificates: Select your development certificate
   - Devices: Select your development Macs

3. **AppKit Framework Development Profile**
   - Type: Mac Development
   - App ID: Your AppKit framework identifier
   - Certificates: Select your development certificate
   - Devices: Select your development Macs

#### Distribution Profiles (if needed)

Create distribution profiles for each target using **Mac App Distribution** type.

## Xcode Configuration

### 1. Update Bundle Identifiers

Open `Outline.xcodeproj` in Xcode and update bundle identifiers:

1. Select **Outline** target → **General** tab
2. Update **Bundle Identifier** to your registered identifier
3. Repeat for **VpnExtension** and **AppKitIntegration** targets

### 2. Configure Code Signing

For each target (**Outline**, **VpnExtension**, **AppKitIntegration**):

1. Select target → **Signing & Capabilities** tab
2. **Team**: Select your Apple Developer team
3. **Signing**: Ensure "Automatically manage signing" is checked
4. **Bundle Identifier**: Should match your registered App ID
5. **Provisioning Profile**: Should show "Xcode Managed Profile" for automatic signing

### 3. Update App Groups

1. Select **Outline** target → **Signing & Capabilities**
2. Find **App Groups** capability
3. Update group identifier to: `group.com.yourcompany.vpnclient`
4. Repeat for **VpnExtension** target

### 4. Verify Network Extensions Capability

Both **Outline** and **VpnExtension** targets should have:

- **Network Extensions** capability
- **Packet Tunnel Provider** enabled

## Entitlements Configuration

### Main App Entitlements (`Outline/Outline.entitlements`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.networking.networkextension</key>
	<array>
		<string>packet-tunnel-provider</string>
	</array>
	<key>com.apple.security.app-sandbox</key>
	<true/>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>group.com.yourcompany.vpnclient</string>
	</array>
	<key>com.apple.security.network.client</key>
	<true/>
</dict>
</plist>
```

### VPN Extension Entitlements (`OutlineLib/VpnExtension/VpnExtension.entitlements`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.networking.networkextension</key>
	<array>
		<string>packet-tunnel-provider</string>
	</array>
	<key>com.apple.security.app-sandbox</key>
	<true/>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>group.com.yourcompany.vpnclient</string>
	</array>
	<key>com.apple.security.network.client</key>
	<true/>
	<key>com.apple.security.network.server</key>
	<true/>
</dict>
</plist>
```

## Development Workflow

### 1. Initial Setup

1. **Log into Xcode**: Go to **Xcode** → **Preferences** → **Accounts** and add your Apple Developer account
2. **Register Devices**: Add your development Mac to your Apple Developer account
3. **Open Project**: Open `Outline.xcodeproj` in Xcode
4. **Select Team**: For each target, select your development team in Signing & Capabilities

### 2. Building for Development

1. **Clean Build**: **Product** → **Clean Build Folder** (⌘⇧K)
2. **Select Destination**: **Product** → **Destination** → **My Mac**
3. **Build**: **Product** → **Build** (⌘B)

> **⚠️ Important**: Always clean the build first. If you don't, it may fail with "Command CodeSign failed with a nonzero exit code".

### 3. Running the App

1. **Run**: **Product** → **Run** (⌘R)
2. **Grant Permissions**: macOS will prompt for VPN configuration permissions
3. **System Extensions**: Allow the Network Extension when prompted

## Troubleshooting

### Code Signing Errors

**Error**: `Command CodeSign failed with a nonzero exit code`

- **Solution**: Clean build folder and try again
- **Alternative**: Check that all targets have valid signing configuration

**Error**: `No profiles for 'com.yourcompany.macos.vpnclient' were found`

- **Solution**: Create provisioning profiles in Apple Developer Portal
- **Alternative**: Ensure bundle identifier matches registered App ID

**Error**: `Your team has no devices from which to generate a profile`

- **Solution**: Register your Mac in Apple Developer Portal under Devices

### VPN Extension Issues

**Error**: `VpnStartFailure`

- **Solution**: Reset VPN extensions:

```bash
pkill -9 VpnExtension
for p in $(pluginkit -Amv | cut -f 4 | grep Outline); do pluginkit -r $p; done
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -gc
```

**Error**: Extension not loading

- **Solution**: Check entitlements match between main app and extension
- **Alternative**: Verify App Group configuration is identical

### Provisioning Profile Issues

**Error**: `Automatic signing is unable to resolve an issue with the "Outline" target's entitlements`

- **Solution**: Manually create provisioning profiles with required capabilities
- **Alternative**: Check that App Groups and Network Extensions are enabled in App ID

## Distribution Setup

For App Store or enterprise distribution:

### 1. Distribution Certificates

- Create **Mac App Distribution** certificate
- Install in Keychain Access

### 2. Distribution Provisioning Profiles

- Create **Mac App Store** or **Mac Ad Hoc** profiles
- Include distribution certificate
- Download and install

### 3. Archive Configuration

1. **Product** → **Archive**
2. **Organizer** → **Distribute App**
3. Follow distribution workflow

## Security Considerations

### Entitlements

- **Network Extensions**: Required for VPN functionality
- **App Sandbox**: Provides security isolation
- **App Groups**: Enables secure communication between app and extension
- **Network Client/Server**: Required for network operations

### Keychain Access

- VPN configurations are stored in system keychain
- Requires user authorization for modifications
- Network Extension runs with elevated privileges

### System Permissions

- **Network Extension Permission**: Required on first run
- **Full Disk Access**: May be required for certain VPN configurations
- **System Extension Policy**: User must approve in System Preferences

## File Locations

- **Main App Entitlements**: `Outline/Outline.entitlements`
- **VPN Extension Entitlements**: `OutlineLib/VpnExtension/VpnExtension.entitlements`
- **Project Configuration**: `Outline.xcodeproj/project.pbxproj`
- **VPN Extension Project**: `OutlineLib/OutlineLib.xcodeproj/project.pbxproj`

## Additional Resources

- [Apple Developer Documentation - Network Extensions](https://developer.apple.com/documentation/networkextension)
- [Code Signing Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/)
- [App Sandbox Design Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/AppSandboxDesignGuide/)
- [Debugging Network Extensions](https://developer.apple.com/forums/thread/705868/)

## Notes

- **No .mobileprovision files**: These are not included in version control as they are developer/organization specific
- **Automatic Signing**: Recommended for development, Xcode handles profile management
- **Team Configuration**: Each developer must configure their own team in Xcode
- **Bundle Identifiers**: Must be unique and registered in your Apple Developer account
- **App Groups**: Critical for VPN extension communication, must be identical across targets
