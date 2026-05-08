"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegister } from "../hooks";

type UserRole = "BURUH" | "MANDOR" | "SUPIR";

const USER_ROLES: UserRole[] = ["BURUH", "MANDOR", "SUPIR"];

function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export default function RegisterForm() {
  const { register, loading, error } = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("BURUH");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    if (role === "MANDOR" && !certificationNumber.trim()) {
      setValidationError("Mandor must provide a certification number");
      return;
    }

    await register({
      name,
      email,
      password,
      role,
      ...(role === "MANDOR" ? { mandorCertificationNumber: certificationNumber.trim() } : {}),
    });
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Create Account
        </h1>

        <p className="text-gray-700 text-center mb-6">
          Register for a MySawit account
        </p>

        {displayError && (
          <div className="bg-red-50 border border-red-300 text-red-800 text-sm p-3 rounded mb-4">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-semibold text-gray-900">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1
              text-gray-900 placeholder-gray-400
              focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1
              text-gray-900 placeholder-gray-400
              focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">
              Password
            </label>

            <input
              type="password"
              placeholder="At least 8 characters"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1
              text-gray-900 placeholder-gray-400
              focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Re-enter your password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1
              text-gray-900 placeholder-gray-400
              focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">
              Role
            </label>

            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1
              text-gray-900
              focus:ring-2 focus:ring-green-500"
               value={role}
              onChange={(e) => {
                const nextRole = e.target.value;
                if (isUserRole(nextRole)) {
                  setRole(nextRole);
                }
              }}
            >
              <option value="BURUH">Buruh</option>
              <option value="MANDOR">Mandor</option>
              <option value="SUPIR">Supir</option>
            </select>
          </div>

          {role === "MANDOR" && (
            <div>
              <label className="text-sm font-semibold text-gray-900">
                Certification Number
              </label>

              <input
                type="text"
                placeholder="Enter your mandor certification number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1
                text-gray-900 placeholder-gray-400
                focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={certificationNumber}
                onChange={(e) => setCertificationNumber(e.target.value)}
                required
              />
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-700 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-green-700 font-semibold hover:text-green-800"
          >
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}