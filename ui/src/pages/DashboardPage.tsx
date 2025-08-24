import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useVpnConnection } from "../hooks/useVpnConnection";
import VpnToggleButton from "../components/VpnToggleButton";
import ConnectionTimer from "../components/ConnectionTimer";
import { cn } from "../utils";

const statusTextMap: Record<
  "disconnected" | "connecting" | "connected" | "error",
  string
> = {
  disconnected: "Disconnected",
  connecting: "Connecting…",
  connected: "Connected",
  error: "Error",
};

const statusColorMap: Record<
  "disconnected" | "connecting" | "connected" | "error",
  string
> = {
  disconnected: "text-slate-500",
  connecting: "text-blue-600",
  connected: "text-emerald-600",
  error: "text-rose-600",
};

const statusDotMap: Record<
  "disconnected" | "connecting" | "connected" | "error",
  string
> = {
  disconnected: "bg-slate-300",
  connecting: "bg-blue-500 animate-pulse",
  connected: "bg-emerald-500",
  error: "bg-rose-500",
};

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const {
    status,
    serverName,
    error,
    isConnected,
    isConnecting,
    isBusy,
    elapsedMs,
    toggle,
    clearError,
  } = useVpnConnection();

  const onToggle = async () => {
    await toggle();
  };

  return (
    <div className="relative min-h-svh overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute -top-28 -left-24 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />

      <header className="px-4 py-4 sm:px-6 lg:px-8">
        <div
          className="
            mx-auto flex max-w-7xl items-center justify-between rounded-2xl
            border border-white/60 bg-white/70 px-4 py-3
            shadow-[0_10px_40px_rgba(2,6,23,0.08)] backdrop-blur-xl ring-1 ring-black/5
          "
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/40">
              <svg
                className="h-6 w-6 text-white"
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
            <div>
              <div className="text-sm font-semibold text-slate-900">
                TeachGate VPN
              </div>
              <div className="text-[12px] text-slate-500">macOS</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-sm text-slate-600 sm:block">
              Signed in as{" "}
              <span className="font-medium text-slate-800">
                {user?.username}
              </span>
            </div>
            <button
              onClick={logout}
              className="
                rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-slate-600
                ring-1 ring-black/5 transition hover:bg-white hover:text-slate-800
                backdrop-blur-xl
              "
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl gap-8">
          {/* Status and Server Card */}
          <section
            className="
              rounded-2xl border border-white/60 bg-white/70 p-6
              shadow-[0_10px_40px_rgba(2,6,23,0.08)] backdrop-blur-xl ring-1 ring-black/5
            "
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-block size-2 rounded-full",
                    statusDotMap[status]
                  )}
                />
                <span
                  className={cn("text-sm font-medium", statusColorMap[status])}
                >
                  {statusTextMap[status]}
                </span>
              </div>

              <VpnToggleButton
                state={status}
                onToggle={onToggle}
                disabled={isBusy}
              />

              <div className="mt-6 grid gap-3">
                {isConnected ? (
                  <ConnectionTimer elapsedMs={elapsedMs} />
                ) : (
                  <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100/70 px-3 py-1.5 text-slate-500 ring-1 ring-inset ring-white/60">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 6v6l4 2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Timer starts on connect
                    </span>
                  </div>
                )}

                <div className="mt-2 text-sm text-slate-600">
                  Server:{" "}
                  <span className="font-medium text-slate-800">
                    {serverName ?? "—"}
                  </span>
                </div>
              </div>

              {isConnecting && (
                <div className="mt-4 text-[12px] text-slate-500">
                  Fetching server configuration…
                </div>
              )}

              {status === "error" && error && (
                <div className="mt-6 w-full max-w-md rounded-xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-rose-800 shadow-sm">
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-none text-rose-500"
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
                    <div className="flex-1">
                      <p className="text-sm leading-6">{error}</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="rounded-lg bg-white/70 px-3 py-1.5 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-300 transition hover:bg-white"
                          onClick={clearError}
                        >
                          Dismiss
                        </button>
                        <button
                          className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)] transition hover:shadow-[0_10px_28px_rgba(37,99,235,0.32)]"
                          onClick={onToggle}
                          disabled={isBusy}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Details Panel */}
          <section
            className="
              rounded-2xl border border-white/60 bg-white/70 p-6
              shadow-[0_10px_40px_rgba(2,6,23,0.08)] backdrop-blur-xl ring-1 ring-black/5
            "
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/60 bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-[12px] font-medium uppercase tracking-wide text-slate-500">
                  Connection Status
                </div>
                <div
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    statusColorMap[status]
                  )}
                >
                  {statusTextMap[status]}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-[12px] font-medium uppercase tracking-wide text-slate-500">
                  Server Name
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-800">
                  {serverName ?? "—"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-[12px] font-medium uppercase tracking-wide text-slate-500">
                  Duration
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {isConnected ? (
                    <ConnectionTimer elapsedMs={elapsedMs} muted />
                  ) : (
                    <span className="font-medium text-slate-500">—</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-[12px] font-medium uppercase tracking-wide text-slate-500">
                  User
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-800">
                  {user?.username}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
