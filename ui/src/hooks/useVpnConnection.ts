import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchVpnConfig,
  isShadowsocksUrl,
  VpnConfigError,
} from "../services/vpn";
import type { VpnConfigApiResponse } from "../services/vpn";
import { authService } from "../services/auth";

// TypeScript declaration for our Cordova bridge
declare global {
  interface Window {
    CordovaBridge?: {
      connectVPN(
        shadowsocksUrl: string,
        name?: string
      ): Promise<{ status: string; tunnelId: string; server: string }>;
      disconnectVPN(
        tunnelId?: string
      ): Promise<{ status: string; tunnelId: string }>;
      getVPNStatus(
        tunnelId?: string
      ): Promise<{ connected: boolean; tunnelId: string | null }>;
      onStatusChange(
        callback: (statusData: {
          tunnelId: string;
          status: string;
          statusCode: number;
        }) => void
      ): void;
      getActiveTunnelId(): string | null;
      clearActiveTunnel(): void;
      isCordovaEnvironment(): boolean;
      isDevelopmentMode(): boolean;
    };
  }
}

export type VpnState = "disconnected" | "connecting" | "connected" | "error";

export interface VpnConnectionInfo {
  status: VpnState;
  serverName?: string | null;
  accessUrl?: string | null;
  connectedAt?: number | null; // epoch ms
  error?: string | null;
  tunnelId?: string | null; // Track native tunnel ID
}

/**
 * useVpnConnection() - Manages VPN connection lifecycle with dynamic server integration.
 * - Fetches server config from /api/user/vpnconfig on connect
 * - Tracks connection state and connection timer
 * - Exposes connect, disconnect, toggle and clearError actions
 */
export function useVpnConnection() {
  const [state, setState] = useState<VpnConnectionInfo>({
    status: "disconnected",
    serverName: null,
    accessUrl: null,
    connectedAt: null,
    error: null,
    tunnelId: null,
  });

  const [isBusy, setIsBusy] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Setup VPN status change listener
  useEffect(() => {
    if (window.CordovaBridge && window.CordovaBridge.isCordovaEnvironment()) {
      window.CordovaBridge.onStatusChange((statusData) => {
        if (!mountedRef.current) return;

        console.log("VPN Status Change:", statusData);

        // Map Cordova status to our VPN state
        let newStatus: VpnState;
        switch (statusData.status) {
          case "connected":
            newStatus = "connected";
            break;
          case "connecting":
          case "reconnecting":
            newStatus = "connecting";
            break;
          case "disconnected":
          case "disconnecting":
            newStatus = "disconnected";
            break;
          default:
            newStatus = "disconnected";
        }

        setState((prev) => {
          // Only update if this is for our tunnel or if we don't have an active tunnel
          if (prev.tunnelId === statusData.tunnelId || !prev.tunnelId) {
            return {
              ...prev,
              status: newStatus,
              tunnelId: statusData.tunnelId,
              // Clear connection time when disconnecting
              connectedAt:
                newStatus === "connected" && prev.status !== "connected"
                  ? Date.now()
                  : newStatus === "disconnected"
                  ? null
                  : prev.connectedAt,
              error: null, // Clear errors on status change
            };
          }
          return prev;
        });
      });
    }
  }, []);

  /**
   * Internal safe state setter to avoid race conditions on unmounted components.
   */
  const safeSetState = useCallback(
    (updater: (prev: VpnConnectionInfo) => VpnConnectionInfo) => {
      if (!mountedRef.current) return;
      setState((prev) => updater(prev));
    },
    []
  );

  /**
   * Connect: fetch dynamic config and enter 'connected' state upon success.
   */
  const connect = useCallback(async () => {
    if (isBusy) return false;

    setIsBusy(true);
    safeSetState((prev) => ({
      ...prev,
      status: "connecting",
      error: null,
    }));

    try {
      const token = authService.getToken() ?? undefined;
      const cfg: VpnConfigApiResponse = await fetchVpnConfig(token);

      if (!isShadowsocksUrl(cfg.accessUrl)) {
        throw new VpnConfigError("Invalid access key format from server");
      }

      // Use Cordova bridge to establish VPN connection with Shadowsocks URL
      if (window.CordovaBridge) {
        try {
          const result = await window.CordovaBridge.connectVPN(
            cfg.accessUrl,
            cfg.serverName
          );

          const connectedAt = Date.now();

          safeSetState((prev) => ({
            ...prev,
            status: "connected",
            serverName: cfg.serverName,
            accessUrl: cfg.accessUrl,
            tunnelId: result.tunnelId,
            connectedAt,
            error: null,
          }));

          return true;
        } catch (bridgeError: any) {
          throw new VpnConfigError(
            `VPN connection failed: ${bridgeError.message || bridgeError}`
          );
        }
      } else {
        // Fallback for development/browser mode
        console.log("Mock VPN Connect:", cfg);
        const connectedAt = Date.now();

        safeSetState((prev) => ({
          ...prev,
          status: "connected",
          serverName: cfg.serverName,
          accessUrl: cfg.accessUrl,
          tunnelId: "mock-tunnel",
          connectedAt,
          error: null,
        }));

        return true;
      }
    } catch (err: any) {
      const message =
        err instanceof VpnConfigError
          ? err.message
          : err?.message || "Failed to connect";

      safeSetState((prev) => ({
        ...prev,
        status: "error",
        error: message,
      }));
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, safeSetState]);

  /**
   * Disconnect: clear connection data and set to 'disconnected'.
   */
  const disconnect = useCallback(async () => {
    if (isBusy) return false;

    setIsBusy(true);
    try {
      // Use Cordova bridge to disconnect VPN
      if (window.CordovaBridge && state.tunnelId) {
        try {
          await window.CordovaBridge.disconnectVPN(state.tunnelId);
        } catch (bridgeError: any) {
          console.warn(
            "Bridge disconnect error (continuing anyway):",
            bridgeError
          );
        }
      } else {
        console.log("Mock VPN Disconnect");
      }

      safeSetState((prev) => ({
        ...prev,
        status: "disconnected",
        connectedAt: null,
        accessUrl: null,
        tunnelId: null,
        error: null,
      }));
      return true;
    } catch (err: any) {
      safeSetState((prev) => ({
        ...prev,
        status: "error",
        error: err?.message || "Failed to disconnect",
      }));
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, safeSetState]);

  /**
   * Toggle: connect if disconnected, disconnect if connecting/connected.
   */
  const toggle = useCallback(async () => {
    if (state.status === "connected" || state.status === "connecting") {
      return disconnect();
    }
    return connect();
  }, [state.status, connect, disconnect]);

  const clearError = useCallback(() => {
    safeSetState((prev) => ({
      ...prev,
      error: null,
      status: prev.status === "error" ? "disconnected" : prev.status,
    }));
  }, [safeSetState]);

  const isConnected = state.status === "connected";
  const isConnecting = state.status === "connecting";
  const hasError = state.status === "error" && !!state.error;

  const elapsedMs = useLiveElapsed(state.connectedAt, isConnected);

  return {
    // state
    status: state.status,
    serverName: state.serverName,
    accessUrl: state.accessUrl,
    connectedAt: state.connectedAt,
    tunnelId: state.tunnelId,
    error: state.error,
    elapsedMs,

    // flags
    isConnected,
    isConnecting,
    hasError,
    isBusy,

    // actions
    connect,
    disconnect,
    toggle,
    clearError,
  };
}

/**
 * Returns a live-updating elapsed milliseconds counter from start timestamp while running=true.
 */
function useLiveElapsed(startMs?: number | null, running?: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running || !startMs) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running, startMs]);

  return useMemo(() => {
    if (!running || !startMs) return 0;
    return Math.max(0, now - startMs);
  }, [now, startMs, running]);
}
