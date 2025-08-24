#!/bin/bash

# Script to reset VPN extensions when encountering VpnStartFailure errors
# Based on Outline's troubleshooting documentation

echo "Resetting VPN extensions..."

# Kill any running VPN extension processes
echo "Killing VPN extension processes..."
pkill -9 VpnExtension

# Unregister all Outline VPN plugins
echo "Unregistering VPN plugins..."
for p in $(pluginkit -Amv | cut -f 4 | grep Outline); do 
    echo "Unregistering: $p"
    pluginkit -r $p
done

# Garbage collect Launch Services database
echo "Garbage collecting Launch Services database..."
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -gc

echo "VPN extension reset complete!"
echo ""
echo "If you still have issues:"
echo "1. Delete VPN configuration in System Preferences > VPN"
echo "2. Restart your Mac"
echo "3. Clean and rebuild the Xcode project"