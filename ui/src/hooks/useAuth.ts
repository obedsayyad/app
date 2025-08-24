import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/auth";
import type { AuthState, LoginRequest, LoginFormErrors } from "../types";

/**
 * Custom hook for authentication management
 * Provides authentication state and methods for login/logout
 */
export const useAuth = () => {
  // Initialize auth state synchronously from storage to avoid blank screen flashes
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const user = authService.getCurrentUser();
      const token = authService.getToken();
      const isAuthenticated =
        !!user && typeof token === "string" && token.trim().length > 0;
      return {
        user: user ?? null,
        isAuthenticated,
        isLoading: false, // avoid initial loading spinner if we already have a token
        error: null,
      };
    } catch {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }
  });

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only show loading if we are not already authenticated from storage
        setAuthState((prev) => ({
          ...prev,
          isLoading: !prev.isAuthenticated,
          error: null,
        }));

        const currentUser = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();

        setAuthState({
          user: currentUser,
          isAuthenticated,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: {
            message: "Failed to initialize authentication",
          },
        });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function with error handling
   */
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      try {
        setAuthState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        const user = await authService.login(credentials);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        const errorMessage = error.message || "Login failed. Please try again.";

        setAuthState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: {
            message: errorMessage,
            code: error.code,
          },
        }));

        throw error; // Re-throw for component-level error handling
      }
    },
    []
  );

  /**
   * Logout function
   */
  const logout = useCallback((): void => {
    try {
      authService.logout();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error during logout:", error);
      // Force state reset even if logout fails
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  /**
   * Clear authentication error
   */
  const clearError = useCallback((): void => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Refresh authentication state
   */
  const refreshAuth = useCallback((): void => {
    try {
      const currentUser = authService.getCurrentUser();
      const isAuthenticated = authService.isAuthenticated();

      setAuthState((prev) => ({
        ...prev,
        user: currentUser,
        isAuthenticated,
        error: currentUser ? null : prev.error,
      }));
    } catch (error) {
      console.error("Error refreshing auth state:", error);
      logout();
    }
  }, [logout]);

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    // Actions
    login,
    logout,
    clearError,
    refreshAuth,

    // Utilities
    getToken: authService.getToken.bind(authService),
  };
};

/**
 * Custom hook for login form validation
 */
export const useLoginForm = () => {
  const [errors, setErrors] = useState<LoginFormErrors>({});

  /**
   * Validate login form data
   */
  const validateForm = useCallback((formData: LoginRequest): boolean => {
    const newErrors: LoginFormErrors = {};

    // Username validation
    if (!formData.username || formData.username.trim().length === 0) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 50) {
      newErrors.username = "Username must be less than 50 characters";
    }

    // Password validation
    if (!formData.password || formData.password.trim().length === 0) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (formData.password.length > 100) {
      newErrors.password = "Password must be less than 100 characters";
    }

    // Security validation
    const invalidCharsRegex = /[<>\"'&]/;
    if (formData.username && invalidCharsRegex.test(formData.username)) {
      newErrors.username = "Username contains invalid characters";
    }

    if (formData.password && invalidCharsRegex.test(formData.password)) {
      newErrors.password = "Password contains invalid characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  /**
   * Clear form errors
   */
  const clearErrors = useCallback((): void => {
    setErrors({});
  }, []);

  /**
   * Clear specific field error
   */
  const clearFieldError = useCallback((field: keyof LoginFormErrors): void => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Set general error (for API errors)
   */
  const setGeneralError = useCallback((message: string): void => {
    setErrors((prev) => ({ ...prev, general: message }));
  }, []);

  return {
    errors,
    validateForm,
    clearErrors,
    clearFieldError,
    setGeneralError,
  };
};

/**
 * Hook to protect routes that require authentication
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    user,
    shouldRedirect: !isLoading && !isAuthenticated,
  };
};
