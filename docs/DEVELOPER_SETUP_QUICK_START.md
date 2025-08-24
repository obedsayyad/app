# Quick Start: Developer Setup for macOS VPN App

This guide provides step-by-step instructions for developers to quickly set up code signing and build the macOS VPN app.

## Prerequisites

✅ **Apple Developer Account** (Individual or Organization)  
✅ **Xcode 15.2+** installed  
✅ **macOS 12.0+** for development

## Step 1: Apple Developer Portal Setup

### 1.1 Create App Identifiers

Go to [Apple Developer Portal](https://developer.apple.com/account/) → **Certificates, Identifiers & Profiles** → **Identifiers**

Create these App IDs with **exact bundle identifiers**:

```
Main App: com.yourcompany.macos.vpnclient
VPN Extension: com.yourcompany.macos.vpnclient.VpnExtension
AppKit Framework: com.yourcompany.macos.vpnclient.AppKitIntegration
```

**Required Capabilities for each:**

- ✅ App Groups
- ✅ Network Extensions

### 1.2 Create App Group

**Identifier**: `group.com.yourcompany.vpnclient`  
**Description**: VPN Client App Group

### 1.3 Register Your Mac

Add your development Mac to **Devices** in the Developer Portal.

## Step 2: Xcode Configuration

### 2.1 Open Project

```bash
open Outline.xcodeproj
```

### 2.2 Add Developer Account

1. **Xcode** → **Preferences** → **Accounts**
2. Click **+** → **Apple ID**
3. Sign in with your Apple Developer account

### 2.3 Configure Signing for Each Target

#### For **Outline** Target:

1. Select **Outline** in project navigator
2. **Signing & Capabilities** tab
3. **Team**: Select your development team
4. **Bundle Identifier**: `com.yourcompany.macos.vpnclient`
5. **App Groups**: Update to `group.com.yourcompany.vpnclient`
6. Verify **Automatically manage signing** is checked

#### For **VpnExtension** Target:

1. Select **OutlineLib.xcodeproj** → **VpnExtension**
2. **Signing & Capabilities** tab
3. **Team**: Select your development team
4. **Bundle Identifier**: `com.yourcompany.macos.vpnclient.VpnExtension`
5. **App Groups**: Update to `group.com.yourcompany.vpnclient`
6. Verify **Automatically manage signing** is checked

#### For **AppKitIntegration** Target:

1. Select **AppKitIntegration**
2. **Signing & Capabilities** tab
3. **Team**: Select your development team
4. **Bundle Identifier**: `com.yourcompany.macos.vpnclient.AppKitIntegration`
5. Verify **Automatically manage signing** is checked

## Step 3: Update Entitlements

### 3.1 Update Main App Entitlements

Edit [`Outline/Outline.entitlements`](../Outline/Outline.entitlements):

```xml
<key>com.apple.security.application-groups</key>
<array>
    <string>group.com.yourcompany.vpnclient</string>
</array>
```

### 3.2 Update VPN Extension Entitlements

Edit [`OutlineLib/VpnExtension/VpnExtension.entitlements`](../OutlineLib/VpnExtension/VpnExtension.entitlements):

```xml
<key>com.apple.security.application-groups</key>
<array>
    <string>group.com.yourcompany.vpnclient</string>
</array>
```

## Step 4: Build and Test

### 4.1 Clean and Build

```bash
# Clean build (CRITICAL - always do this first)
# In Xcode: Product → Clean Build Folder (⌘⇧K)

# Build
# In Xcode: Product → Build (⌘B)
```

### 4.2 Run the App

```bash
# In Xcode: Product → Run (⌘R)
```

**First Run Permissions:**

- macOS will prompt for VPN configuration permissions → **Allow**
- System Extension approval → **Allow** in System Preferences

## Troubleshooting

### Common Issues

**❌ Code Signing Error**: `Command CodeSign failed with a nonzero exit code`

```bash
# Solution: Clean build folder first
# Xcode: Product → Clean Build Folder (⌘⇧K)
```

**❌ VpnStartFailure Error**: App won't connect to VPN

```bash
# Run our reset script
./scripts/reset_vpn_extensions.sh
```

**❌ No Provisioning Profiles**: `No profiles found`

- Ensure bundle identifiers match registered App IDs exactly
- Check that your Mac is registered in Developer Portal
- Verify team selection in Xcode

**❌ Network Extension Won't Load**

- Verify App Groups are identical between main app and extension
- Check that Network Extensions capability is enabled
- Restart Mac if extensions are stuck

### Debug VPN Extension

```bash
# View VPN extension logs
log stream --info --predicate 'senderImagePath contains "Outline.app" or (processImagePath contains "Outline.app" and subsystem contains "com.apple.networkextension")'

# In Xcode: Debug → Attach to Process → VpnExtension
```

## Verification Checklist

Before building, verify:

- [ ] Apple Developer account added to Xcode
- [ ] All 3 App IDs created in Developer Portal
- [ ] App Group created and configured
- [ ] Development Mac registered
- [ ] All targets have correct bundle identifiers
- [ ] All targets have development team selected
- [ ] App Groups match in main app and VPN extension
- [ ] Automatic signing enabled for all targets

## Next Steps

After successful build:

1. Test VPN connection functionality
2. Review logs for any runtime issues
3. For distribution, see [`CODE_SIGNING_SETUP.md`](./CODE_SIGNING_SETUP.md)

## Support

- **Detailed Setup**: See [`CODE_SIGNING_SETUP.md`](./CODE_SIGNING_SETUP.md)
- **VPN Extension Reset**: Run [`scripts/reset_vpn_extensions.sh`](../scripts/reset_vpn_extensions.sh)
- **Apple Documentation**: [Network Extensions Programming Guide](https://developer.apple.com/documentation/networkextension)
