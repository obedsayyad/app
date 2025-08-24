import React, { useEffect, useState } from "react";
import { cn } from "../utils";
import { formatHMS } from "../services/vpn";

export interface ConnectionTimerProps {
  elapsedMs: number;
  className?: string;
  muted?: boolean;
}

/**
 * ConnectionTimer - Displays "Connected for HH:MM:SS"
 */
const ConnectionTimer: React.FC<ConnectionTimerProps> = ({
  elapsedMs,
  className,
  muted,
}) => {
  const [display, setDisplay] = useState("00:00:00");

  useEffect(() => {
    setDisplay(formatHMS(elapsedMs));
  }, [elapsedMs]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-1.5",
        muted
          ? "bg-slate-100/70 text-slate-500 ring-1 ring-inset ring-white/60"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70",
        "shadow-sm backdrop-blur",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("h-4 w-4", muted ? "text-slate-400" : "text-emerald-600")}
        aria-hidden="true"
      >
        <path
          d="M12 8v5m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-medium">Connected for {display}</span>
    </div>
  );
};

export default ConnectionTimer;
