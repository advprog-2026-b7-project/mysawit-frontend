"use client";

import { useAuth } from "@/features/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MANDOR":
        return "bg-blue-100 text-blue-800";
      case "BURUH":
        return "bg-green-100 text-green-800";
      case "SUPIR":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const NavCard = ({ title, description, onClick }: { title: string; description?: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left hover:bg-gray-50"
    >
      <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.username}!</p>
          </div>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Email</p>
              <p className="text-gray-900 font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Username</p>
              <p className="text-gray-900 font-semibold">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Role</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">User ID</p>
              <p className="text-gray-900 font-mono text-xs">{user.id.substring(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-8">
          {/* Profile Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavCard
                title="My Profile"
                description="View your personal profile details"
                onClick={() => router.push("/profile")}
              />
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavCard
                title="Plantation"
                description="Manage plantation data"
                onClick={() => router.push("/plantation")}
              />
              <NavCard
                title="Harvest"
                description="Track harvest activities"
                onClick={() => router.push("/harvest")}
              />
              <NavCard
                title="Delivery"
                description="Manage deliveries"
                onClick={() => router.push("/delivery")}
              />
              <NavCard
                title="Payment"
                description="View payment information"
                onClick={() => router.push("/payment")}
              />
            </div>
          </div>

          {/* Admin Section */}
          {user.role === "ADMIN" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Panel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NavCard
                  title="User Management"
                  description="View and manage all users in the system"
                  onClick={() => router.push("/admin/users")}
                />
                <NavCard
                  title="Assignment Management"
                  description="Assign and reassign Buruh to Mandor"
                  onClick={() => router.push("/admin/assignments")}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}