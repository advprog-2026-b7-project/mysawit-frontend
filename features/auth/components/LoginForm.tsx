"use client";

import { useState } from "react";
import Link from "next/link";
import { useLogin, useGoogleLogin } from "../hooks";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

export default function LoginForm() {
  const { login, loading, error } = useLogin();
  const { googleLogin, loading: googleLoading, error: googleError } = useGoogleLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      await googleLogin(credentialResponse.credential);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-gray-700 text-center mb-6">
          Sign in to your MySawit account
        </p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        {googleError && (
          <div className="bg-red-50 border border-red-300 text-red-800 text-sm p-3 rounded mb-4">
            {googleError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

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
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1
              text-gray-900 placeholder-gray-400
              focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading || googleLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition disabled:bg-gray-400"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-600">Or continue with</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="mt-4 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Login failed")}
            size="large"
            width="100%"
          />
        </div>

        <p className="text-center text-sm text-gray-700 mt-6">
          Don’t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-green-700 font-semibold hover:text-green-800"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}
