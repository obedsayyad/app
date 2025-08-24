# TeachGate VPN UI

Modern React + Vite interface for the TeachGate macOS VPN application, replacing the legacy Cordova web UI with a clean, native-feeling toggle interface.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
ui/
├── src/
│   ├── components/          # React components
│   │   ├── VpnToggle/      # Main VPN toggle component
│   │   ├── ServerSelection/ # Server selection interface
│   │   ├── StatusIndicator/ # Connection status display
│   │   ├── ErrorDisplay/   # Error handling component
│   │   └── Layout/         # Layout components
│   ├── services/           # Service layer
│   │   └── vpn/            # VPN communication service
│   ├── hooks/              # Custom React hooks
│   │   └── useVpn.ts       # VPN state management
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── constants/          # Application constants
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Design System

### Colors (macOS-inspired)

- **Primary Blue**: `#007AFF` - Main action color
- **Success Green**: `#34C759` - Connected state
- **Warning Orange**: `#FF9500` - Connecting state
- **Error Red**: `#FF3B30` - Error states
- **Gray Scale**: `macos-gray-{50-900}` - UI elements

### Components

- **Button Primary**: `btn-primary` class
- **Button Secondary**: `btn-secondary` class
- **Card**: `card` class for containers
- **Toggle Switch**: `toggle-switch` for VPN toggle
- **Status Indicators**: `status-{connected|disconnected|connecting|error}`

## 🔧 Development Scripts

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Production build
npm run build:watch     # Watch mode for development
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
npm run clean            # Clean build artifacts
npm run build:cordova    # Build and copy to Cordova
npm run dev:cordova      # Development with Cordova integration
npm run analyze          # Bundle size analysis
```

## 🔗 Integration with Native macOS

### API Endpoints

The UI communicates with the native macOS VPN bridge through these endpoints:

- `GET /api/vpn/status` - Get current VPN status
- `POST /api/vpn/connect` - Connect to VPN server
- `POST /api/vpn/disconnect` - Disconnect from VPN
- `GET /api/servers` - Get available servers
- `GET /api/config` - Get VPN configuration
- `PUT /api/config` - Update VPN configuration

### Development Server

- **Host**: `0.0.0.0:3000` (accessible from native app)
- **Proxy**: API calls proxied to `http://localhost:8080` (native bridge)
- **Hot Reload**: Automatic refresh on code changes

### Production Build

- **Output**: `dist/` directory
- **Assets**: Optimized and minified
- **Manifest**: Generated for native app integration
- **Target**: ES2020 for modern WebView compatibility

## 🎯 Core Features

### VPN Toggle Interface

- **One-click connect/disconnect**
- **Visual connection status** (connecting, connected, error)
- **Server selection** with latency testing
- **Real-time status updates**

### Native macOS Integration

- **System font** (SF Pro)
- **macOS color palette**
- **Native-feeling animations**
- **Status bar integration ready**

### Error Handling

- **Toast notifications** for user feedback
- **Graceful error recovery**
- **Detailed error logging**
- **Network connectivity checks**

## 🛠 Development Workflow

### 1. Component Development

```bash
# Start development server
npm run dev

# Create new component in appropriate directory
# Follow existing patterns for consistency
# Use TypeScript interfaces from types/index.ts
```

### 2. Styling Guidelines

- Use Tailwind utility classes
- Leverage macOS-inspired color palette
- Follow component class patterns (.btn-primary, .card, etc.)
- Test with different screen sizes

### 3. State Management

```typescript
// Use the custom useVpn hook
import { useVpn } from "../hooks/useVpn";

function MyComponent() {
  const { connection, connect, disconnect, loading } = useVpn();
  // ... component logic
}
```

### 4. Integration Testing

```bash
# Build for Cordova integration
npm run build:cordova

# Test with native bridge
npm run dev:cordova
```

## 📱 Cordova Integration

The built UI integrates seamlessly with the existing Cordova/Xcode project:

1. **Build**: `npm run build` creates optimized assets
2. **Copy**: Assets copied to `../cordova/www/`
3. **Native Bridge**: Communicates via JavaScript bridge
4. **WebView**: Renders in native macOS WebView

## 🔍 Performance

- **Fast Development**: Vite's instant HMR
- **Optimized Build**: Tree-shaking and code splitting
- **Small Bundle**: Lightweight dependencies
- **Native Feel**: Smooth animations and interactions

## 🐛 Debugging

- **Browser DevTools**: Full React DevTools support
- **Console Logging**: Comprehensive error logging
- **Network Tab**: Monitor API calls to native bridge
- **Vite Overlay**: Hot reload error display

## 📦 Dependencies

### Core

- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling

### UI Components

- **Headless UI**: Accessible component primitives
- **Heroicons**: Beautiful SVG icon library
- **React Hot Toast**: Toast notifications

### State Management

- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **Custom Hooks**: VPN-specific state logic

## 🚢 Deployment

The UI is designed to be embedded in the native macOS application:

1. **Development**: Served by Vite dev server
2. **Production**: Built assets loaded by WebView
3. **Updates**: Can be updated without app store submission
4. **Offline**: Core functionality works offline

---

**Next Steps**: Implement core VPN components and integrate with the native macOS bridge system.
