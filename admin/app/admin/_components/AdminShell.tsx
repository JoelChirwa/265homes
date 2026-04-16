"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { clearAdminToken, getAdminToken } from "../_lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/listings", label: "Listings Ops", icon: "🏘️" },
  { href: "/admin/payments", label: "Payments", icon: "💳" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "✅" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
];

type AdminShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AdminShell({ title, subtitle, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
    }
  }, [router]);

  const logout = () => {
    clearAdminToken();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-72 shrink-0 rounded-2xl bg-slate-900 p-5 text-white lg:block">
          <div className="border-b border-slate-700 pb-5">
            <h1 className="text-2xl font-extrabold">
              265Homes <span className="text-blue-400">Admin</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300">Platform operations workspace</p>
          </div>

          <nav className="mt-5 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span className="text-lg" aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
                <p className="text-sm text-slate-500">{subtitle}</p>
              </div>
              <Link
                href="/"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                View Landing Page
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="mt-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
