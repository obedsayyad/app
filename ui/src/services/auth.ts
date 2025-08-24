import type { LoginRequest, LoginResponse, User } from "../types";

// API Configuration
const API_BASE_URL = "https://b-stg.cx-tg.develentcorp.com/api";
const AUTH_ENDPOINTS = {
  LOGIN: "/auth/user/login",
};

// Token storage keys
const TOKEN_KEY = "vpn_auth_token";
const USER_KEY = "vpn_user_data";
const TOKEN_EXPIRY_KEY = "vpn_token_expiry";

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login user with username and password
   */
  async login(credentials: LoginRequest): Promise<User> {
    try {
      this.validateCredentials(credentials);

      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await this.handleResponse<LoginResponse>(response);

      if (!data.token) {
        throw new Error("No token received from server");
      }

      // Create user object
      const user: User = {
        username: credentials.username,
        token: data.token,
        tokenExpiry: this.calculateTokenExpiry(),
      };

      // Store authentication data
      this.storeAuthData(user);

      return user;
    } catch (error) {
      const authError = this.formatError(error);
      console.error("Login failed:", authError);
      throw authError;
    }
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.warn("Error clearing auth data:", error);
    }
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

      if (!userData || !token) {
        return null;
      }

      const user: User = JSON.parse(userData);
      user.token = token;

      if (expiry) {
        user.tokenExpiry = new Date(expiry);

        // Check if token has expired
        if (user.tokenExpiry < new Date()) {
          this.logout();
          return null;
        }
      }

      return user;
    } catch (error) {
      console.error("Error retrieving user data:", error);
      this.logout(); // Clear potentially corrupted data
      return null;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && this.isTokenValid(user.token);
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  }

  /**
   * Validate user credentials
   */
  private validateCredentials(credentials: LoginRequest): void {
    if (!credentials.username || !credentials.password) {
      throw new AuthError("Username and password are required", 400);
    }

    if (credentials.username.trim().length === 0) {
      throw new AuthError("Username cannot be empty", 400);
    }

    if (credentials.password.trim().length === 0) {
      throw new AuthError("Password cannot be empty", 400);
    }

    // Basic input validation for security
    const invalidCharsRegex = /[<>\"'&]/;
    if (
      invalidCharsRegex.test(credentials.username) ||
      invalidCharsRegex.test(credentials.password)
    ) {
      throw new AuthError("Invalid characters in username or password", 400);
    }
  }

  /**
   * Handle API response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    let data: any;

    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      throw new AuthError("Invalid response from server", response.status);
    }

    if (!response.ok) {
      const errorMessage = this.getErrorMessageFromStatus(
        response.status,
        data
      );
      throw new AuthError(errorMessage, response.status);
    }

    // Handle successful response
    if (response.status === 200) {
      // Direct token response
      if (data.token) {
        return data as T;
      }

      // Wrapped response
      if (data.success && data.data) {
        return data.data as T;
      }
    }

    throw new AuthError("Unexpected response format", response.status);
  }

  /**
   * Get appropriate error message based on response status
   */
  private getErrorMessageFromStatus(status: number, data: any): string {
    // Try to get error message from response body first
    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }

    // Fallback to status-based messages matching API spec
    switch (status) {
      case 400:
        return data?.message || "Username and password are required";
      case 401:
        return "Invalid username or password";
      case 500:
        return "An error occurred during the login process.";
      case 429:
        return "Too many login attempts. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return `Login failed with status ${status}`;
    }
  }

  /**
   * Store authentication data securely
   */
  private storeAuthData(user: User): void {
    try {
      const userData = {
        username: user.username,
        tokenExpiry: user.tokenExpiry,
      };

      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_KEY, user.token);

      if (user.tokenExpiry) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, user.tokenExpiry.toISOString());
      }
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw new AuthError("Failed to store authentication data", 500);
    }
  }

  /**
   * Calculate token expiry time (24 hours from now)
   */
  private calculateTokenExpiry(): Date {
    const now = new Date();
    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Check if token is valid (basic format validation)
   */
  private isTokenValid(token: string): boolean {
    if (!token || typeof token !== "string") {
      return false;
    }

    // Basic JWT format check (header.payload.signature)
    const parts = token.split(".");
    return parts.length === 3;
  }

  /**
   * Format error for consistent error handling
   */
  private formatError(error: any): AuthError {
    if (error instanceof AuthError) {
      return error;
    }

    if (error instanceof Error) {
      return new AuthError(error.message);
    }

    if (typeof error === "string") {
      return new AuthError(error);
    }

    return new AuthError("An unexpected error occurred");
  }
}

/**
 * Custom AuthError class for authentication-related errors
 */
class AuthError extends Error {
  public code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
