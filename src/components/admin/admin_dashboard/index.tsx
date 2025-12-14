"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { lexend } from "@/libs/fonts";
import secureLocalStorage from "react-secure-storage";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verify token with backend
    const verifyToken = async () => {
      try {
        // We don't need to send the token header if we rely on the cookie
        // But if we want to support both, we can keep it if available
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch("/api/auth/verify", {
          headers,
        });

        if (!response.ok) {
          throw new Error("Invalid token");
        }

        const data = await response.json();

        if (data.success) {
          setUser(data.user); // Use user data from server
          setLoading(false);
          // router.push("/admin/dashboard"); // Already here
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        // Clear invalid tokens
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        secureLocalStorage.removeItem("auth");
        router.push("/admin/login");
      }
    };

    verifyToken();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      secureLocalStorage.removeItem("auth");
      router.push("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${lexend.className} min-h-screen bg-gray-50`}>
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Welcome,{" "}
                <span className="font-medium text-blue-600">{user?.name}</span>{" "}
                • {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition"
            >
              View Dashboard
            </button>

            <div className="relative group">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer">
                <span className="text-blue-600 font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLogout()}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Admin Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-blue-500 mt-2">Manage user accounts</p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Port Data
              </h3>
              <p className="text-3xl font-bold text-green-600">6</p>
              <p className="text-sm text-green-500 mt-2">
                Configure port information
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Agents
              </h3>
              <p className="text-3xl font-bold text-purple-600">8</p>
              <p className="text-sm text-purple-500 mt-2">
                Manage shipping agents
              </p>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition">
                  Add New User
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition">
                  Update Port Data
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition">
                  Configure Settings
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">User login</p>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">Dashboard accessed</p>
                  <span className="text-xs text-gray-500">2 mins ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <p className="text-sm text-gray-600">No other activities</p>
                  <span className="text-xs text-gray-500">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Admin Dashboard • v1.0.0 • {new Date().getFullYear()}
          </p>
          <p className="text-sm text-gray-500">
            Logged in as: <span className="font-medium">{user?.name}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
