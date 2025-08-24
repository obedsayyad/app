# TeachGate VPN - Go Build Configuration

This document describes the Go build configuration for the TeachGate macOS VPN app, following the proven architecture from Outline Apps.

## System Requirements

### macOS Development

- **macOS**: 12.0 (Monterey) or later
- **Xcode**: 14.0 or later with Command Line Tools
- **Go**: 1.25 or later
- **Task**: Build automation tool ([installation guide](https://taskfile.dev/installation/))

### Dependencies

- **Homebrew** (recommended for installing Task)
- **CGO**: Enabled for C/Objective-C integration
- **gomobile**: For Apple platform cross-compilation (automatically installed)

## Installation

### 1. Install Task (Build Automation)

```bash
brew install go-task/tap/go-task
```

### 2. Install Go Dependencies

```bash
go mod download
go mod tidy
```

## Build Configuration

### Module Structure

- **Module Name**: `github.com/teachgate/vpn-client`
- **VPN Core**: [`outline/`](outline/) - Core VPN functionality
- **Configuration**: [`configyaml/`](configyaml/) - YAML configuration parsing
- **Build Scripts**: [`scripts/`](scripts/) - Xcode integration scripts

### Build Targets

#### Available Tasks

```bash
# List all available tasks
task --list

# Core macOS builds
task go:tun2socks:apple                    # XCFramework for iOS/macOS/Catalyst
task go:tun2socks:macos:amd64             # Intel Mac binary + static library
task go:tun2socks:macos:arm64             # Apple Silicon binary + static library
task go:tun2socks:macos-universal        # Universal macOS static library
```

#### Architecture Support

- **darwin/amd64**: Intel-based Macs (x86_64)
- **darwin/arm64**: Apple Silicon Macs (M1/M2/M3)
- **maccatalyst**: Mac Catalyst for iOS apps on macOS

### CGO Configuration

The build system uses the following CGO settings for macOS:

```bash
CGO_ENABLED=1
MACOSX_DEPLOYMENT_TARGET=12.0
CGO_CFLAGS="-fstack-protector-strong -mmacosx-version-min=12.0"
CGO_LDFLAGS="-mmacosx-version-min=12.0"
```

## Build Outputs

### Directory Structure

```
output/
├── client/
│   ├── apple/                     # XCFramework for Apple platforms
│   │   └── Tun2socks.xcframework/
│   ├── darwin-amd64/              # Intel Mac builds
│   │   ├── vpn-core               # Executable binary
│   │   ├── libvpn-core.a          # Static library
│   │   └── libvpn-core.h          # C header
│   ├── darwin-arm64/              # Apple Silicon builds
│   │   ├── vpn-core               # Executable binary
│   │   ├── libvpn-core.a          # Static library
│   │   └── libvpn-core.h          # C header
│   └── macos-universal/           # Universal builds
│       ├── libvpn-core.a          # Universal static library
│       └── libvpn-core.h          # C header
└── xcode/                         # Xcode integration
    ├── lib/libvpn-core.a          # Universal static library
    ├── include/libvpn-core.h      # C header
    └── Tun2socks.xcframework/     # XCFramework
```

## Usage

### Basic Builds

```bash
# Build for specific architecture
task go:tun2socks:macos:amd64     # Intel Macs
task go:tun2socks:macos:arm64     # Apple Silicon Macs

# Build universal library
task go:tun2socks:macos-universal

# Build XCFramework for all Apple platforms
task go:tun2socks:apple
```

### Xcode Integration

#### Using the Build Script

```bash
# Build for Xcode integration (recommended)
./scripts/build-xcode.sh universal

# Build for specific architecture
./scripts/build-xcode.sh amd64
./scripts/build-xcode.sh arm64
```

#### Manual Xcode Setup

1. **Library Path**: Add `output/xcode/lib` to Library Search Paths
2. **Header Path**: Add `output/xcode/include` to Header Search Paths
3. **Link Library**: Add `libvpn-core.a` to Link Binary With Libraries
4. **Alternative**: Use `Tun2socks.xcframework` for broader platform support

#### Xcode Project Settings

- **Deployment Target**: macOS 12.0+
- **Architectures**: Standard (Universal Binary)
- **Build Settings**:
  - Enable C++ Language Features
  - Enable Modules (C and Objective-C)

## Development

### Key Files

- [`go.mod`](go.mod) - Go module definition with dependencies
- [`go/Taskfile.yml`](go/Taskfile.yml) - Main build configuration
- [`Taskfile.yml`](Taskfile.yml) - Root task orchestration
- [`scripts/build-xcode.sh`](scripts/build-xcode.sh) - Xcode integration script
- [`scripts/xconfig.sh`](scripts/xconfig.sh) - Cross-compilation configuration

### Build Process

1. **gomobile** builds mobile bindings for Apple platforms
2. **CGO** compiles with C/Objective-C integration
3. **lipo** creates universal binaries combining architectures
4. **XCFramework** packages for distribution and Xcode integration

### Dependencies

Key Go modules used:

- [`github.com/Jigsaw-Code/outline-sdk`](https://github.com/Jigsaw-Code/outline-sdk) - Core Outline SDK
- [`github.com/eycorsican/go-tun2socks`](https://github.com/eycorsican/go-tun2socks) - TUN2SOCKS implementation
- [`golang.org/x/mobile`](https://golang.org/x/mobile) - Mobile compilation tools

## Troubleshooting

### Common Issues

1. **Task not found**

   ```bash
   brew install go-task/tap/go-task
   ```

2. **CGO compilation errors**

   - Ensure Xcode Command Line Tools are installed: `xcode-select --install`
   - Verify macOS SDK is available: `xcrun --show-sdk-path`

3. **gomobile errors**

   - Dependencies auto-install via the [`gomobile`](go/Taskfile.yml:214) task
   - Force rebuild: `task go:tun2socks:gomobile --force`

4. **Module import errors**
   - Run `go mod tidy` to resolve dependencies
   - Ensure all import paths use `github.com/teachgate/vpn-client/`

### Verification

```bash
# Verify builds work
./scripts/build-xcode.sh universal

# Check binary architecture
file output/xcode/lib/libvpn-core.a
lipo -info output/xcode/lib/libvpn-core.a

# Verify XCFramework
xcodebuild -checkFirstLaunchExperience -project output/xcode/Tun2socks.xcframework
```

## Architecture

The build system follows Outline's proven approach:

- **Cross-compilation** for multiple architectures
- **gomobile** for mobile platform bindings
- **CGO integration** for system-level networking
- **XCFramework** for modern Xcode distribution
- **Task automation** for consistent builds

This configuration supports both standalone macOS apps and Mac Catalyst apps that can run iOS code on macOS.
