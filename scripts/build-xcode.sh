#!/bin/bash
#
# Copyright 2025 TeachGate VPN
# Build script for Xcode integration
#
# This script builds the Go VPN core and prepares it for Xcode integration
# Usage: ./scripts/build-xcode.sh [architecture]
#   architecture: amd64, arm64, or universal (default: universal)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

function log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

function log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default architecture
ARCH="${1:-universal}"

# Validate architecture
case $ARCH in
    amd64|arm64|universal)
        log_info "Building for architecture: $ARCH"
        ;;
    *)
        log_error "Invalid architecture: $ARCH"
        log_error "Valid options: amd64, arm64, universal"
        exit 1
        ;;
esac

# Check if task command is available
if ! command -v task &> /dev/null; then
    log_error "Task command not found. Please install Task: https://taskfile.dev/"
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT"

# Check if Go module is initialized
if [ ! -f "go.mod" ]; then
    log_error "go.mod not found. Make sure Go module is initialized."
    exit 1
fi

log_info "Building Go VPN core for macOS..."

# Build based on architecture
case $ARCH in
    universal)
        log_info "Building universal macOS library..."
        if task go:tun2socks:macos-universal; then
            log_info "Universal build completed successfully"
        else
            log_error "Universal build failed"
            exit 1
        fi
        ;;
    amd64|arm64)
        log_info "Building for $ARCH architecture..."
        if task "go:tun2socks:macos:$ARCH"; then
            log_info "Build for $ARCH completed successfully"
        else
            log_error "Build for $ARCH failed"
            exit 1
        fi
        ;;
esac

# Create Xcode-friendly directory structure
XCODE_DIR="$PROJECT_ROOT/output/xcode"
mkdir -p "$XCODE_DIR/lib" "$XCODE_DIR/include"

case $ARCH in
    universal)
        # Copy universal library and headers
        if [ -f "$PROJECT_ROOT/output/client/macos-universal/libvpn-core.a" ]; then
            cp "$PROJECT_ROOT/output/client/macos-universal/libvpn-core.a" "$XCODE_DIR/lib/"
            cp "$PROJECT_ROOT/output/client/macos-universal/libvpn-core.h" "$XCODE_DIR/include/"
            log_info "Universal library and headers copied to $XCODE_DIR"
        else
            log_error "Universal library not found"
            exit 1
        fi
        ;;
    *)
        # Copy specific architecture library and headers
        LIB_PATH="$PROJECT_ROOT/output/client/darwin-$ARCH/libvpn-core.a"
        HEADER_PATH="$PROJECT_ROOT/output/client/darwin-$ARCH/libvpn-core.h"
        if [ -f "$LIB_PATH" ]; then
            cp "$LIB_PATH" "$XCODE_DIR/lib/libvpn-core-$ARCH.a"
            cp "$HEADER_PATH" "$XCODE_DIR/include/libvpn-core.h"
            log_info "Library and headers for $ARCH copied to $XCODE_DIR"
        else
            log_error "Library for $ARCH not found at $LIB_PATH"
            exit 1
        fi
        ;;
esac

# Also build the Apple XCFramework for broader iOS/macOS support
log_info "Building Apple XCFramework for broader platform support..."
if task go:tun2socks:apple; then
    log_info "Apple XCFramework build completed successfully"
    
    # Copy XCFramework to Xcode directory
    if [ -d "$PROJECT_ROOT/output/client/apple/Tun2socks.xcframework" ]; then
        cp -R "$PROJECT_ROOT/output/client/apple/Tun2socks.xcframework" "$XCODE_DIR/"
        log_info "XCFramework copied to $XCODE_DIR"
    fi
else
    log_warn "Apple XCFramework build failed, but continuing with static library"
fi

log_info "Build completed successfully!"
log_info "Xcode integration files available at: $XCODE_DIR"
log_info ""
log_info "To integrate with Xcode:"
log_info "1. Add the library path: $XCODE_DIR/lib"
log_info "2. Add the header path: $XCODE_DIR/include"
log_info "3. Link against: libvpn-core.a"
log_info "4. Or use XCFramework: Tun2socks.xcframework"