import { useState, useEffect, useCallback } from "react";
import { vpnService } from "../services/vpn/index";
import type { VpnConnection, VpnServer, VpnConfig } from "../types";
import { VPN_STATUS, UI_CONSTANTS } from "../constants";

/**
 * Custom hook for VPN state management
 */
export function useVpn() {
  const [connection, setConnection] = useState<VpnConnection>({
    status: VPN_STATUS.DISCONNECTED,
  });
  const [servers, setServers] = useState<VpnServer[]>([]);
  const [config, setConfig] = useState<VpnConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize VPN data
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setLoading(true);

        // Load initial data in parallel
        const [status, serverList, vpnConfig] = await Promise.all([
          vpnService.getStatus(),
          vpnService.getServers(),
          vpnService.getConfig(),
        ]);

        if (isMounted) {
          setConnection(status);
          setServers(serverList);
          setConfig(vpnConfig);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to initialize VPN"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = vpnService.onConnectionChange((newConnection) => {
      setConnection(newConnection);
    });

    return unsubscribe;
  }, []);

  // Polling for status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await vpnService.getStatus();
        setConnection(status);
      } catch (err) {
        console.error("Failed to poll VPN status:", err);
      }
    }, UI_CONSTANTS.POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Connect to VPN
  const connect = useCallback(async (server: VpnServer): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const success = await vpnService.connect(server);
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect from VPN
  const disconnect = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const success = await vpnService.disconnect();
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Disconnection failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle VPN connection
  const toggle = useCallback(
    async (server?: VpnServer): Promise<boolean> => {
      if (
        connection.status === VPN_STATUS.CONNECTED ||
        connection.status === VPN_STATUS.CONNECTING
      ) {
        return disconnect();
      } else {
        if (!server && servers.length > 0) {
          // Use first available server if none specified
          server = servers[0];
        }
        if (server) {
          return connect(server);
        }
        setError("No server available");
        return false;
      }
    },
    [connection.status, servers, connect, disconnect]
  );

  // Update configuration
  const updateConfig = useCallback(
    async (newConfig: Partial<VpnConfig>): Promise<boolean> => {
      try {
        const success = await vpnService.updateConfig(newConfig);
        if (success && config) {
          setConfig({ ...config, ...newConfig });
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Config update failed";
        setError(errorMessage);
        return false;
      }
    },
    [config]
  );

  // Test server latency
  const testLatency = useCallback(
    async (server: VpnServer): Promise<number | null> => {
      return vpnService.testServerLatency(server);
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed properties
  const isConnected = connection.status === VPN_STATUS.CONNECTED;
  const isConnecting =
    connection.status === VPN_STATUS.CONNECTING ||
    connection.status === VPN_STATUS.DISCONNECTING;
  const hasError = connection.status === VPN_STATUS.ERROR || !!error;

  return {
    // State
    connection,
    servers,
    config,
    loading,
    error,

    // Computed
    isConnected,
    isConnecting,
    hasError,

    // Actions
    connect,
    disconnect,
    toggle,
    updateConfig,
    testLatency,
    clearError,
  };
}

/**
 * Hook for server selection with latency testing
 */
export function useServerSelection() {
  const { servers, testLatency } = useVpn();
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [testing, setTesting] = useState(false);

  const testAllServers = useCallback(async () => {
    if (testing || servers.length === 0) return;

    setTesting(true);
    const results: Record<string, number> = {};

    // Test servers in parallel with some delay to avoid overwhelming
    const promises = servers.map(async (server, index) => {
      // Stagger requests slightly
      await new Promise((resolve) => setTimeout(resolve, index * 100));

      const latency = await testLatency(server);
      if (latency !== null) {
        results[server.id] = latency;
      }
    });

    await Promise.all(promises);
    setLatencies(results);
    setTesting(false);
  }, [servers, testLatency, testing]);

  const getServerWithLatency = useCallback(
    (server: VpnServer) => ({
      ...server,
      latency: latencies[server.id],
    }),
    [latencies]
  );

  const sortedServers = servers.map(getServerWithLatency).sort((a, b) => {
    if (a.latency && b.latency) {
      return a.latency - b.latency;
    }
    if (a.latency) return -1;
    if (b.latency) return 1;
    return a.name.localeCompare(b.name);
  });

  return {
    servers: sortedServers,
    latencies,
    testing,
    testAllServers,
    getServerWithLatency,
  };
}
