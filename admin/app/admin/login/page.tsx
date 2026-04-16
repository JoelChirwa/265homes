"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ADMIN_API_BASE_URL } from "../_lib/api";
import { setAdminToken } from "../_lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@265homes.mw");
  const [password, setPassword] = useState("admin12345");
  const [busy, setBusy] = useState(false);

  const login = async () => {
    try {
      setBusy(true);
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message ?? "Login failed");
      }
      setAdminToken(result.token);
      router.replace("/admin");
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to access the 265Homes admin panel.</p>

        <div className="mt-5 space-y-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Email"
          />
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Password"
          />
        </div>

        <button
          type="button"
          onClick={login}
          disabled={busy}
          className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </div>
  );
}
