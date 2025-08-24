// VPN Status Constants
export const VPN_STATUS = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTING: "disconnecting",
  ERROR: "error",
} as const;

export type VpnStatus = (typeof VPN_STATUS)[keyof typeof VPN_STATUS];

// Error Codes
export const ERROR_CODES = {
  CONNECTION_FAILED: "CONNECTION_FAILED",
  SERVER_UNREACHABLE: "SERVER_UNREACHABLE",
  INVALID_ACCESS_KEY: "INVALID_ACCESS_KEY",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Default Settings
export const DEFAULT_CONFIG = {
  autoConnect: false,
  killSwitch: false,
  dnsSettings: {
    useCustomDns: false,
    servers: ["1.1.1.1", "8.8.8.8"],
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  CONNECT: "/api/vpn/connect",
  DISCONNECT: "/api/vpn/disconnect",
  STATUS: "/api/vpn/status",
  SERVERS: "/api/servers",
  CONFIG: "/api/config",
} as const;

// Connection Timeouts (in milliseconds)
export const TIMEOUTS = {
  CONNECTION: 30000, // 30 seconds
  STATUS_CHECK: 5000, // 5 seconds
  SERVER_PING: 3000, // 3 seconds
} as const;

// UI Constants
export const UI_CONSTANTS = {
  POLLING_INTERVAL: 2000, // 2 seconds
  MAX_RETRIES: 3,
  TOAST_DURATION: 3000, // 3 seconds
} as const;
