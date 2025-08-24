import type { VpnStatus, ErrorCode } from "../constants";

// VPN Server
export interface VpnServer {
  id: string;
  name: string;
  location: string;
  flag: string;
  latency?: number;
  load?: number;
  accessKey?: string;
}

// VPN Connection State
export interface VpnConnection {
  status: VpnStatus;
  server?: VpnServer;
  connectedAt?: Date;
  bytesTransferred?: {
    sent: number;
    received: number;
  };
  error?: VpnError;
}

// VPN Error Types
export interface VpnError {
  code: ErrorCode;
  message: string;
  details?: string;
  timestamp: Date;
}

// VPN Configuration
export interface VpnConfig {
  autoConnect: boolean;
  selectedServer?: string;
  killSwitch: boolean;
  dnsSettings: {
    useCustomDns: boolean;
    servers: string[];
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// App State
export interface AppState {
  connection: VpnConnection;
  config: VpnConfig;
  servers: VpnServer[];
  loading: boolean;
}

// Component Props Types
export interface VpnToggleProps {
  status: VpnStatus;
  onToggle: () => void;
  loading?: boolean;
}

export interface ServerSelectionProps {
  servers: VpnServer[];
  selectedServer?: VpnServer;
  onServerSelect: (server: VpnServer) => void;
}

export interface StatusIndicatorProps {
  status: VpnStatus;
  server?: VpnServer;
  connectedAt?: Date;
  bytesTransferred?: {
    sent: number;
    received: number;
  };
}

export interface ErrorDisplayProps {
  error: VpnError | null;
  onDismiss: () => void;
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthError {
  message: string;
  code?: number;
}

export interface User {
  username: string;
  token: string;
  tokenExpiry?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

// Auth API Response Types
export interface AuthApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}
