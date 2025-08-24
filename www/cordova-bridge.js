/**
 * TeachGate VPN Cordova Bridge
 *
 * This module provides a simplified interface for React to communicate
 * with the native macOS VPN functionality through Cordova plugins.
 */

class CordovaBridge {
  constructor() {
    this.isReady = false;
    this.readyCallbacks = [];
    this.activeTunnelId = null;
    this.statusCallbacks = [];
    this.setupDeviceReady();
  }

  setupDeviceReady() {
    // Wait for Cordova to be ready
    document.addEventListener("deviceready", () => {
      console.log("Cordova device ready");
      this.isReady = true;
      this.readyCallbacks.forEach((callback) => callback());
      this.readyCallbacks = [];
    });
  }

  // Ensure Cordova is ready before executing callback
  onReady(callback) {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  // VPN Operations - using Outline's existing Swift methods
  async connectVPN(shadowsocksUrl, name = "TeachGate VPN") {
    return new Promise((resolve, reject) => {
      this.onReady(() => {
        if (window.cordova) {
          // Generate a unique tunnel ID for this connection
          const tunnelId = `teachgate-${Date.now()}`;
          this.activeTunnelId = tunnelId;

          // Use Outline's start method: start(tunnelId, name, transportConfig)
          cordova.exec(
            (result) => {
              console.log("VPN Connected:", tunnelId);
              resolve({
                status: "connected",
                tunnelId,
                server: shadowsocksUrl,
              });
            },
            (error) => {
              console.error("VPN Connection failed:", error);
              this.activeTunnelId = null;
              reject(error);
            },
            "OutlinePlugin",
            "start",
            [tunnelId, name, shadowsocksUrl]
          );
        } else {
          // Fallback for browser/development mode
          console.log("VPN Connect (Mock):", { shadowsocksUrl, name });
          resolve({
            status: "connected",
            tunnelId: "mock-tunnel",
            server: shadowsocksUrl,
          });
        }
      });
    });
  }

  async disconnectVPN(tunnelId) {
    return new Promise((resolve, reject) => {
      this.onReady(() => {
        if (window.cordova) {
          // If no tunnelId provided, use the active one
          tunnelId = tunnelId || this.activeTunnelId;

          if (!tunnelId) {
            return reject(new Error("No active tunnel to disconnect"));
          }

          // Use Outline's stop method: stop(tunnelId)
          cordova.exec(
            (result) => {
              console.log("VPN Disconnected:", tunnelId);
              if (tunnelId === this.activeTunnelId) {
                this.activeTunnelId = null;
              }
              resolve({ status: "disconnected", tunnelId });
            },
            (error) => {
              console.error("VPN Disconnect failed:", error);
              reject(error);
            },
            "OutlinePlugin",
            "stop",
            [tunnelId]
          );
        } else {
          // Fallback for browser/development mode
          console.log("VPN Disconnect (Mock)");
          resolve({ status: "disconnected" });
        }
      });
    });
  }

  async getVPNStatus(tunnelId) {
    return new Promise((resolve, reject) => {
      this.onReady(() => {
        if (window.cordova) {
          // If no tunnelId provided, use the active one
          tunnelId = tunnelId || this.activeTunnelId;

          if (!tunnelId) {
            return resolve({ connected: false, tunnelId: null });
          }

          // Use Outline's isRunning method: isRunning(tunnelId)
          cordova.exec(
            (isRunning) => resolve({ connected: isRunning, tunnelId }),
            (error) => {
              console.error("Get VPN Status failed:", error);
              reject(error);
            },
            "OutlinePlugin",
            "isRunning",
            [tunnelId]
          );
        } else {
          // Fallback for browser/development mode
          console.log("Get VPN Status (Mock)");
          resolve({ connected: false, tunnelId: null });
        }
      });
    });
  }

  // Register for VPN status change notifications
  onStatusChange(callback) {
    this.onReady(() => {
      if (window.cordova) {
        cordova.exec(
          (statusData) => {
            // statusData contains { id: tunnelId, status: statusCode }
            // Status codes: 0=connected, 1=disconnected, 2=reconnecting, 3=disconnecting
            const statusMap = {
              0: "connected",
              1: "disconnected",
              2: "reconnecting",
              3: "disconnecting",
            };
            callback({
              tunnelId: statusData.id,
              status: statusMap[statusData.status] || "unknown",
              statusCode: statusData.status,
            });
          },
          (error) => console.error("Status change error:", error),
          "OutlinePlugin",
          "onStatusChange",
          []
        );
      } else {
        // Mock status changes for development
        console.log("Status change callback registered (Mock)");
      }
    });
  }

  // System Operations (macOS only)
  async quitApplication() {
    return new Promise((resolve, reject) => {
      this.onReady(() => {
        if (window.cordova) {
          // Use Outline's quitApplication method (macOS only)
          cordova.exec(resolve, reject, "OutlinePlugin", "quitApplication", []);
        } else {
          console.log("Quit Application (Mock)");
          resolve();
        }
      });
    });
  }

  // Helper method to get current tunnel ID
  getActiveTunnelId() {
    return this.activeTunnelId;
  }

  // Helper method to clear active tunnel (useful for error handling)
  clearActiveTunnel() {
    this.activeTunnelId = null;
  }

  // Utility method to check if we're running in Cordova environment
  isCordovaEnvironment() {
    return !!window.cordova;
  }

  // Development helper
  isDevelopmentMode() {
    return !this.isCordovaEnvironment() || window.location.protocol === "http:";
  }
}

// Create global instance
window.CordovaBridge = new CordovaBridge();

// Export for ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CordovaBridge;
}
