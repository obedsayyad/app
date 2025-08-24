import clsx from "clsx";
import type { ClassValue } from "clsx";

/**
 * Utility function to combine class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if running in development mode
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Parse access key URL
 */
export function parseAccessKey(url: string): {
  valid: boolean;
  key?: string;
  server?: string;
} {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== "ss:") {
      return { valid: false };
    }

    // Extract base64 encoded part
    const encodedPart = urlObj.href.replace("ss://", "").split("#")[0];
    const decoded = atob(encodedPart);

    return {
      valid: true,
      key: encodedPart,
      server: urlObj.hostname || "Unknown Server",
    };
  } catch {
    return { valid: false };
  }
}

/**
 * Validate server configuration
 */
export function validateServerConfig(config: any): boolean {
  return !!(
    config &&
    config.method &&
    config.password &&
    config.server &&
    config.server_port
  );
}
