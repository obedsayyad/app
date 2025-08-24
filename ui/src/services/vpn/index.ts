import type {
  VpnConnection,
  VpnServer,
  VpnConfig,
  ApiResponse,
} from "../../types";
import { VPN_STATUS, API_ENDPOINTS, TIMEOUTS } from "../../constants";
import toast from "react-hot-toast";

/**
 * VPN Service - Handles all VPN-related operations
 * Communicates with the native macOS bridge through APIs
 */
export class VpnService {
  private static instance: VpnService;
  private connectionListeners: Set<(connection: VpnConnection) => void> =
    new Set();

  private constructor() {}

  public static getInstance(): VpnService {
    if (!VpnService.instance) {
      VpnService.instance = new VpnService();
    }
    return VpnService.instance;
  }

  /**
   * Subscribe to connection status changes
   */
  public onConnectionChange(
    callback: (connection: VpnConnection) => void
  ): () => void {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  private notifyConnectionChange(connection: VpnConnection): void {
    this.connectionListeners.forEach((callback) => callback(connection));
  }

  /**
   * Get current VPN status
   */
  public async getStatus(): Promise<VpnConnection> {
    try {
      const response = await this.apiCall<VpnConnection>(API_ENDPOINTS.STATUS);
      if (response.success && response.data) {
        return response.data;
      }

      // Return default disconnected state if API call fails
      return {
        status: VPN_STATUS.DISCONNECTED,
      };
    } catch (error) {
      console.error("Failed to get VPN status:", error);
      return {
        status: VPN_STATUS.ERROR,
        error: {
          code: "NETWORK_ERROR",
          message: "Failed to get VPN status",
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Connect to VPN server
   */
  public async connect(server: VpnServer): Promise<boolean> {
    try {
      toast.loading("Connecting to VPN...", { id: "vpn-connect" });

      const response = await this.apiCall<VpnConnection>(
        API_ENDPOINTS.CONNECT,
        {
          method: "POST",
          body: JSON.stringify({ server }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.success && response.data) {
        toast.success(`Connected to ${server.name}`, { id: "vpn-connect" });
        this.notifyConnectionChange(response.data);
        return true;
      } else {
        toast.error(response.error || "Failed to connect", {
          id: "vpn-connect",
        });
        return false;
      }
    } catch (error) {
      console.error("VPN connection failed:", error);
      toast.error("Connection failed", { id: "vpn-connect" });
      return false;
    }
  }

  /**
   * Disconnect from VPN
   */
  public async disconnect(): Promise<boolean> {
    try {
      toast.loading("Disconnecting...", { id: "vpn-disconnect" });

      const response = await this.apiCall<VpnConnection>(
        API_ENDPOINTS.DISCONNECT,
        {
          method: "POST",
        }
      );

      if (response.success && response.data) {
        toast.success("Disconnected", { id: "vpn-disconnect" });
        this.notifyConnectionChange(response.data);
        return true;
      } else {
        toast.error(response.error || "Failed to disconnect", {
          id: "vpn-disconnect",
        });
        return false;
      }
    } catch (error) {
      console.error("VPN disconnection failed:", error);
      toast.error("Disconnection failed", { id: "vpn-disconnect" });
      return false;
    }
  }

  /**
   * Get available servers
   */
  public async getServers(): Promise<VpnServer[]> {
    try {
      const response = await this.apiCall<VpnServer[]>(API_ENDPOINTS.SERVERS);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch servers:", error);
      return [];
    }
  }

  /**
   * Get VPN configuration
   */
  public async getConfig(): Promise<VpnConfig | null> {
    try {
      const response = await this.apiCall<VpnConfig>(API_ENDPOINTS.CONFIG);
      return response.data || null;
    } catch (error) {
      console.error("Failed to get config:", error);
      return null;
    }
  }

  /**
   * Update VPN configuration
   */
  public async updateConfig(config: Partial<VpnConfig>): Promise<boolean> {
    try {
      const response = await this.apiCall<VpnConfig>(API_ENDPOINTS.CONFIG, {
        method: "PUT",
        body: JSON.stringify(config),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.success;
    } catch (error) {
      console.error("Failed to update config:", error);
      return false;
    }
  }

  /**
   * Test server latency
   */
  public async testServerLatency(server: VpnServer): Promise<number | null> {
    try {
      const start = Date.now();
      await fetch(`http://${server.location}`, {
        method: "HEAD",
        signal: AbortSignal.timeout(TIMEOUTS.SERVER_PING),
      });
      return Date.now() - start;
    } catch {
      return null;
    }
  }

  /**
   * Generic API call helper
   */
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.CONNECTION);

    try {
      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Unknown error occurred",
      };
    }
  }
}

// Export singleton instance
export const vpnService = VpnService.getInstance();
