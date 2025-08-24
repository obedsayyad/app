/**
 * VPN Config API integration for fetching dynamic server access details
 * Endpoint: GET /api/user/vpnconfig
 * Headers: Authorization: Bearer <jwt-token>
 *
 * Expected 200 response:
 * {
 *   "accessUrl": "ss://...",
 *   "serverName": "Server-TX-3",
 *   "serverId": 6
 * }
 */

import { authService } from "./auth";

const API_BASE_URL = "https://b-stg.cx-tg.develentcorp.com/api";
const VPNCONFIG_ENDPOINT = "/user/vpnconfig";

export type VpnConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface VpnConfigApiResponse {
  accessUrl: string; // Shadowsocks access key URL (Outline compatible)
  serverName: string; // Human-friendly server name, e.g. "Server-TX-3"
  serverId: number; // Internal server identifier
}

export class VpnConfigError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "VpnConfigError";
    this.status = status;
  }
}

/**
 * Fetch VPN configuration (dynamic server) for the authenticated user.
 * This should be called on each connect toggle to ensure fresh server allocation.
 */
export async function fetchVpnConfig(
  token?: string
): Promise<VpnConfigApiResponse> {
  const authToken = token ?? authService.getToken();
  if (!authToken) {
    throw new VpnConfigError("Unauthorized", 401);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}${VPNCONFIG_ENDPOINT}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      // Try to extract structured error first
      let message: string | undefined;
      try {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            message = data?.message || data?.error || text;
          } catch {
            message = text;
          }
        }
      } catch {
        // ignore
      }

      switch (response.status) {
        case 401:
          throw new VpnConfigError(message || "Unauthorized", 401);
        case 404:
          throw new VpnConfigError(
            message ||
              "No online servers available or no access key found for the selected server",
            404
          );
        case 500:
          throw new VpnConfigError(
            message || "An error occurred while fetching the VPN config.",
            500
          );
        default:
          throw new VpnConfigError(
            message || `Failed to fetch VPN config (HTTP ${response.status})`,
            response.status
          );
      }
    }

    // Parse success payload
    const data = (await response.json()) as VpnConfigApiResponse;

    // Basic shape validation
    if (
      !data?.accessUrl ||
      !data?.serverName ||
      typeof data.serverId !== "number"
    ) {
      throw new VpnConfigError("Unexpected VPN config response format", 500);
    }

    return data;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new VpnConfigError(
        "Request timed out while fetching VPN config",
        408
      );
    }
    if (err instanceof VpnConfigError) {
      throw err;
    }
    throw new VpnConfigError(
      err?.message || "Network error while fetching VPN config"
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Format a connection status into a human-readable label
 */
export function formatConnectionStatus(state: VpnConnectionState): string {
  switch (state) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting…";
    case "disconnected":
      return "Disconnected";
    case "error":
      return "Error";
    default:
      return "Unknown";
  }
}

/**
 * Utility: format HH:MM:SS from milliseconds
 */
export function formatHMS(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Lightweight Shadowsocks URL validator (Outline-style)
 */
export function isShadowsocksUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "ss:";
  } catch {
    return false;
  }
}
