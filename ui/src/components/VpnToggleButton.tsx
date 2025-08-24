import React from "react";
import { cn } from "../utils";

export type ToggleState = "disconnected" | "connecting" | "connected" | "error";

export interface VpnToggleButtonProps {
  state: ToggleState;
  onToggle: () => void | Promise<void | boolean>;
  disabled?: boolean;
  className?: string;
}

/**
 * VpnToggleButton - Large, macOS-style, glassy toggle button
 * - States: disconnected, connecting, connected, error
 * - Smooth transitions and subtle glow
 */
const VpnToggleButton: React.FC<VpnToggleButtonProps> = ({
  state,
  onToggle,
  disabled,
  className,
}) => {
  const isConnected = state === "connected";
  const isConnecting = state === "connecting";
  const hasError = state === "error";

  const label = isConnecting
    ? "Connecting…"
    : isConnected
    ? "Disconnect"
    : "Connect";
  const sub = hasError ? "Error" : isConnected ? "Connected" : "Disconnected";

  return (
    <button
      type="button"
      disabled={disabled || isConnecting}
      onClick={onToggle}
      className={cn(
        "group relative mx-auto grid size-44 place-items-center rounded-[28px]",
        "transition-all duration-300 ease-out",
        "ring-1 ring-black/5 border border-white/60 backdrop-blur-xl",
        // background glass layer
        "before:absolute before:inset-0 before:rounded-[28px] before:bg-white/70 before:backdrop-blur-xl before:content-['']",
        // hover/active transforms
        "hover:translate-y-[-1px] hover:shadow-[0_20px_50px_rgba(2,6,23,0.15)] active:translate-y-[0px]",
        // state styles
        isConnected
          ? "shadow-[0_16px_40px_rgba(16,185,129,0.25)]"
          : hasError
          ? "shadow-[0_16px_40px_rgba(239,68,68,0.25)]"
          : isConnecting
          ? "shadow-[0_16px_40px_rgba(37,99,235,0.25)] animate-pulse"
          : "shadow-[0_16px_40px_rgba(2,6,23,0.12)]",
        className
      )}
      aria-label={label}
    >
      {/* Gradient glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-[28px] blur-2xl opacity-60",
          isConnected
            ? "bg-gradient-to-br from-emerald-400/50 via-emerald-500/40 to-emerald-600/30"
            : hasError
            ? "bg-gradient-to-br from-red-400/50 via-rose-500/40 to-red-600/30"
            : "bg-gradient-to-br from-blue-400/40 via-indigo-500/35 to-blue-600/25"
        )}
        aria-hidden="true"
      />

      {/* Inner content layer */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          className={cn(
            "grid size-16 place-items-center rounded-2xl ring-1 ring-white/50 border border-white/50",
            "shadow-inner",
            isConnected
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
              : hasError
              ? "bg-gradient-to-br from-rose-500 to-red-600 text-white"
              : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
          )}
        >
          {/* Icon */}
          {isConnected ? (
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
              <path
                d="M9 12l2 2 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : hasError ? (
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
              <path
                d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : isConnecting ? (
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 animate-spin"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="opacity-30"
              />
              <path
                d="M21 12a9 9 0 00-9-9"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
              <path
                d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 12l1.75 1.75L15 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className="mt-4 text-center">
          <div className="text-base font-semibold text-slate-900">{label}</div>
          <div className="text-[12px] text-slate-500">{sub}</div>
        </div>
      </div>

      <span className="sr-only">{label}</span>
    </button>
  );
};

export default VpnToggleButton;
