import React from "react";
import { useAuth } from "../hooks/useAuth";

const VpnDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                TeachGate VPN
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="h-12 w-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            VPN Dashboard Coming Soon
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            You have successfully logged in! The VPN toggle interface with
            connection timer will be implemented in the next phase of
            development.
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Status
                </span>
                <span className="text-sm text-red-600 font-medium">
                  Disconnected
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">User</span>
                <span className="text-sm text-gray-900 font-medium">
                  {user?.username}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-600">
                  Authentication
                </span>
                <span className="text-sm text-green-600 font-medium">
                  Active
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="w-full h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-gray-500 text-sm font-medium">
                  VPN Toggle (Coming Soon)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VpnDashboard;
