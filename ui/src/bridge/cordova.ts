// Cordova bridge shim for TeachGate VPN
// Exposes a stable window.CordovaBridge API used by the React UI.
// - In native Cordova runtime: wraps cordova.exec to call OutlinePlugin (Swift).
// - In browser/dev runtime: provides safe mocks so the UI remains testable.

type StatusString =
  | "connected"
  | "connecting"
  | "reconnecting"
  | "disconnecting"
  | "disconnected"
  | "error";

interface StatusPayload {
  tunnelId: string;
  status: StatusString;
  statusCode: number;
}

interface CordovaBridgeApi {
  connectVPN(
    shadowsocksUrl: string,
    name?: string
  ): Promise<{ status: StatusString; tunnelId: string; server: string }>;
  disconnectVPN(
    tunnelId?: string
  ): Promise<{ status: StatusString; tunnelId: string }>;
  getVPNStatus(
    tunnelId?: string
  ): Promise<{ connected: boolean; tunnelId: string | null }>;
  onStatusChange(callback: (status: StatusPayload) => void): void;
  getActiveTunnelId(): string | null;
  clearActiveTunnel(): void;
  isCordovaEnvironment(): boolean;
  isDevelopmentMode(): boolean;
}

declare global {
  interface Window {
    cordova?: {
      exec?: (
        success: (result?: any) => void,
        failure: (err?: any) => void,
        service: string,
        action: string,
        args: any[]
      ) => void;
    };
    __DEV__?: boolean; // injected by Vite define
  }
}

const OUTLINE_PLUGIN = "OutlinePlugin";
const TUNNEL_STORAGE_KEY = "tg_active_tunnel_id";

function ensureTunnelId(): string {
  const existing = localStorage.getItem(TUNNEL_STORAGE_KEY);
  if (existing && existing.length > 0) {
    return existing;
  }
  const id = `tg-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  localStorage.setItem(TUNNEL_STORAGE_KEY, id);
  return id;
}

function getStoredTunnelId(): string | null {
  return localStorage.getItem(TUNNEL_STORAGE_KEY);
}

function clearStoredTunnelId() {
  try {
    localStorage.removeItem(TUNNEL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function mapTunnelStatus(code: number): StatusString {
  switch (code) {
    case 0:
      return "connected";
    case 1:
      return "disconnected";
    case 2:
      return "reconnecting";
    case 3:
      return "disconnecting";
    default:
      return "error";
  }
}

function isCordovaEnv(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window as any).cordova &&
    !!(window as any).cordova.exec
  );
}

function isDev(): boolean {
  // Set by Vite define in vite.config.ts
  return !!(window as any).__DEV__ || process.env.NODE_ENV === "development";
}

function execCordova<T = any>(action: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!isCordovaEnv()) {
      return reject(new Error("Cordova runtime not available"));
    }
    try {
      (window as any).cordova!.exec!(
        (result?: any) => resolve(result as T),
        (err?: any) =>
          reject(err ?? new Error(`Cordova exec error for action ${action}`)),
        OUTLINE_PLUGIN,
        action,
        args
      );
    } catch (e) {
      reject(e);
    }
  });
}

// Native-backed implementation using OutlinePlugin via cordova.exec
const nativeBridge: CordovaBridgeApi = {
  async connectVPN(shadowsocksUrl: string, name?: string) {
    if (!shadowsocksUrl || typeof shadowsocksUrl !== "string") {
      throw new Error("connectVPN: shadowsocksUrl is required");
    }
    if (!shadowsocksUrl.startsWith("ss://")) {
      throw new Error("connectVPN: invalid access key (expected ss:// URL)");
    }
    const tunnelId = ensureTunnelId();
    // OutlinePlugin.start(tunnelId, name, transportConfigText)
    await execCordova<void>(
      "start",
      tunnelId,
      name ?? "TeachGate Server",
      shadowsocksUrl
    );
    // We will receive async status updates via onStatusChange; here return initial state.
    return { status: "connecting", tunnelId, server: name ?? "" };
  },

  async disconnectVPN(tunnelId?: string) {
    const id = tunnelId || getStoredTunnelId();
    if (!id) {
      // Idempotent disconnect
      return { status: "disconnected", tunnelId: "" };
    }
    await execCordova<void>("stop", id);
    clearStoredTunnelId();
    return { status: "disconnected", tunnelId: id };
  },

  async getVPNStatus(tunnelId?: string) {
    const id = tunnelId || getStoredTunnelId();
    if (!id) {
      return { connected: false, tunnelId: null };
    }
    const running = await execCordova<boolean>("isRunning", id);
    return { connected: !!running, tunnelId: running ? id : null };
  },

  onStatusChange(callback: (status: StatusPayload) => void) {
    if (!isCordovaEnv()) {
      // No-op in non-cordova; consumer will still function.
      return;
    }
    // Register a long-lived callback. The plugin will keep this callbackId and
    // stream tunneling status changes as { id: string, status: number }.
    (window as any).cordova!.exec!(
      (data: { id: string; status: number }) => {
        const statusCode = data?.status ?? -1;
        const status = mapTunnelStatus(statusCode);
        // Maintain active tunnel tracking
        if (
          status === "connected" ||
          status === "connecting" ||
          status === "reconnecting"
        ) {
          if (data?.id) localStorage.setItem(TUNNEL_STORAGE_KEY, data.id);
        } else if (status === "disconnected") {
          // Do not immediately clear to allow UI to query last id for cleanup;
          // leave it to disconnectVPN or caller to clear.
        }
        try {
          callback({
            tunnelId: data?.id ?? getStoredTunnelId() ?? "",
            status,
            statusCode,
          });
        } catch (e) {
          // Swallow user callback errors to avoid breaking native stream
          console.warn("CordovaBridge onStatusChange callback error", e);
        }
      },
      (err?: any) => {
        console.warn("CordovaBridge failed to register onStatusChange", err);
      },
      OUTLINE_PLUGIN,
      "onStatusChange",
      []
    );
  },

  getActiveTunnelId() {
    return getStoredTunnelId();
  },

  clearActiveTunnel() {
    clearStoredTunnelId();
  },

  isCordovaEnvironment() {
    return isCordovaEnv();
  },

  isDevelopmentMode() {
    return isDev();
  },
};

// Browser/dev mock implementation (no cordova runtime)
const mockBridge: CordovaBridgeApi = {
  async connectVPN(shadowsocksUrl: string, name?: string) {
    const tunnelId = ensureTunnelId();
    console.log("[Mock] connectVPN", { shadowsocksUrl, name, tunnelId });
    // Simulate quick connect and a status callback shortly after.
    setTimeout(() => {
      try {
        const cb = (window as any).CordovaBridgeStatusCb as
          | ((s: StatusPayload) => void)
          | undefined;
        cb?.({ tunnelId, status: "connected", statusCode: 0 });
      } catch {
        // ignore
      }
    }, 300);
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            status: "connected",
            tunnelId,
            server: name ?? "Mock Server",
          }),
        400
      )
    );
  },
  async disconnectVPN(tunnelId?: string) {
    const id = tunnelId || getStoredTunnelId() || "mock-tunnel";
    console.log("[Mock] disconnectVPN", { id });
    clearStoredTunnelId();
    return new Promise((resolve) =>
      setTimeout(() => resolve({ status: "disconnected", tunnelId: id }), 200)
    );
  },
  async getVPNStatus(tunnelId?: string) {
    const id = tunnelId || getStoredTunnelId();
    return { connected: !!id, tunnelId: id ?? null };
  },
  onStatusChange(callback: (status: StatusPayload) => void) {
    // Save a global to optionally trigger from connect mock
    (window as any).CordovaBridgeStatusCb = callback;
  },
  getActiveTunnelId() {
    return getStoredTunnelId();
  },
  clearActiveTunnel() {
    clearStoredTunnelId();
  },
  isCordovaEnvironment() {
    return false;
  },
  isDevelopmentMode() {
    return true;
  },
};

// Install the bridge on window once.
(function initBridge() {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.CordovaBridge) return; // Do not override if already present
  w.CordovaBridge = isCordovaEnv() ? nativeBridge : mockBridge;
})();
