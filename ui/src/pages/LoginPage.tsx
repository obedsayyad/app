import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth, useLoginForm } from "../hooks/useAuth";
import type { LoginFormData } from "../types";

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const {
    errors,
    validateForm,
    clearFieldError,
    setGeneralError,
    clearErrors,
  } = useLoginForm();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear auth error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name as keyof typeof errors]) {
      clearFieldError(name as keyof typeof errors);
    }

    // Clear general error when user starts typing
    if (errors.general) {
      clearFieldError("general");
    }

    // Clear auth error
    if (error) {
      clearError();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();
    clearError();

    // Validate form
    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData);
      // Programmatic navigation to ensure route change without transient blank
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const errorMessage = err?.message || "Login failed. Please try again.";
      setGeneralError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className="relative min-h-svh overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />

      {/* Center container */}
      <div className="mx-auto flex min-h-svh max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        {/* Card */}
        <div
          className="
            w-full max-w-lg
            rounded-2xl border border-white/60 bg-white/70
            shadow-[0_10px_40px_rgba(2,6,23,0.08)]
            backdrop-blur-xl
            ring-1 ring-black/5
          "
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-3 px-8 pt-10 text-center sm:px-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/40">
              <svg
                className="h-7 w-7 text-white"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 12l1.75 1.75L15 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
                Welcome back
              </h1>
              <p className="text-sm text-slate-600">
                Sign in to access TeachGate VPN
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            className="px-8 pb-10 pt-8 sm:px-10 sm:pt-8"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* General Error */}
            {(errors.general || error) && (
              <div className="mb-6 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-red-800 shadow-sm">
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-none text-red-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 9v4m0 4h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm leading-6">
                    {errors.general || error?.message}
                  </p>
                </div>
              </div>
            )}

            {/* Username */}
            <div className="mb-5">
              <label
                htmlFor="username"
                className="mb-2 block text-[13px] font-medium text-slate-700"
              >
                Username
              </label>
              <div
                className={`
                  group relative flex items-center rounded-xl bg-white/80
                  ring-1 ring-inset transition
                  ${
                    errors.username
                      ? "ring-red-300"
                      : "ring-slate-200 hover:ring-slate-300"
                  }
                  focus-within:ring-2 focus-within:ring-blue-500
                `}
              >
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={isFormLoading}
                  value={formData.username}
                  onChange={handleInputChange}
                  className="
                    w-full rounded-xl bg-transparent px-4 py-3 text-[14px] text-slate-900
                    placeholder:text-slate-400 outline-none
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-[12px] text-red-600">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-2 block text-[13px] font-medium text-slate-700"
              >
                Password
              </label>
              <div
                className={`
                  group relative flex items-center rounded-xl bg-white/80
                  ring-1 ring-inset transition
                  ${
                    errors.password
                      ? "ring-red-300"
                      : "ring-slate-200 hover:ring-slate-300"
                  }
                  focus-within:ring-2 focus-within:ring-blue-500
                `}
              >
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isFormLoading}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="
                    w-full rounded-xl bg-transparent px-4 py-3 pr-12 text-[14px] text-slate-900
                    placeholder:text-slate-400 outline-none
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  disabled={isFormLoading}
                  onClick={togglePasswordVisibility}
                  className="
                    absolute inset-y-0 right-0 flex items-center px-3 text-slate-400
                    transition-colors hover:text-slate-600 focus:outline-none
                    disabled:cursor-not-allowed
                  "
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-[12px] text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isFormLoading}
                className={`
                  group relative inline-flex w-full items-center justify-center gap-2
                  rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600
                  px-4 py-3 text-[14px] font-semibold text-white
                  shadow-[0_8px_24px_rgba(37,99,235,0.25)]
                  transition-all
                  hover:shadow-[0_10px_28px_rgba(37,99,235,0.32)]
                  hover:-translate-y-[1px]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                  disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none
                `}
              >
                {isFormLoading && (
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {isFormLoading ? "Signing in…" : "Sign in"}
              </button>

              <p className="text-center text-[12px] leading-5 text-slate-500">
                By continuing you agree to the TeachGate Terms and Privacy
                Policy.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
