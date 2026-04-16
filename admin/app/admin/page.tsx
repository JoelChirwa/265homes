"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "./_components/AdminShell";
import { adminApiRequest } from "./_lib/api";

const quickActions = [
  { title: "View Tenants", subtitle: "Manage tenant accounts", icon: "🏠" },
  { title: "View Landlords", subtitle: "Support landlord accounts", icon: "🧑‍💼" },
  { title: "Track Payments", subtitle: "Monitor transactions", icon: "💰" },
  { title: "Revenue Report", subtitle: "Review monthly trends", icon: "📑" },
];

export default function AdminPage() {
  const [summary, setSummary] = useState<{
    usersSummary: { totalUsers: number; tenants: number; landlords: number };
    financeSummary: { monthlyRevenue: number; paidSubscribers: number; pendingPayments: number };
    recentPayments: Array<{ reference: string; phone: string; amount: number; status: string }>;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const response = await adminApiRequest<{
        usersSummary: { totalUsers: number; tenants: number; landlords: number };
        financeSummary: { monthlyRevenue: number; paidSubscribers: number; pendingPayments: number };
        recentPayments: Array<{ reference: string; phone: string; amount: number; status: string }>;
      }>("/admin/dashboard/summary");
      setSummary(response);
    }

    void loadData();
  }, []);

  const users = [
    { label: "Total Users", value: String(summary?.usersSummary.totalUsers ?? 0) },
    { label: "Tenants", value: String(summary?.usersSummary.tenants ?? 0) },
    { label: "Landlords", value: String(summary?.usersSummary.landlords ?? 0) },
  ];

  const finance = [
    {
      label: "Monthly Revenue",
      value: `MWK ${(summary?.financeSummary.monthlyRevenue ?? 0).toLocaleString()}`,
    },
    { label: "Active Subscriptions", value: String(summary?.financeSummary.paidSubscribers ?? 0) },
    { label: "Pending Payments", value: String(summary?.financeSummary.pendingPayments ?? 0) },
  ];

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Monitor users, payments and performance."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <article key={action.title} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
              <span aria-hidden>{action.icon}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{action.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{action.subtitle}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {users.map((item) => (
          <article key={item.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {finance.map((item) => (
          <article key={item.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-blue-700">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Recent Subscription Payments</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-2 py-2 font-semibold">Transaction</th>
                  <th className="px-2 py-2 font-semibold">Phone</th>
                  <th className="px-2 py-2 font-semibold">Amount</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {(summary?.recentPayments ?? []).map((payment) => (
                  <tr key={payment.reference} className="border-b border-slate-100">
                    <td className="px-2 py-3 font-medium">{payment.reference}</td>
                    <td className="px-2 py-3">{payment.phone}</td>
                    <td className="px-2 py-3">MWK {payment.amount.toLocaleString()}</td>
                    <td className="px-2 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          payment.status.toLowerCase().includes("success") ||
                          payment.status.toLowerCase() === "resolved_manually"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Live System Snapshot</h2>
          <p className="mt-2 text-sm text-slate-600">
            Dashboard values are fetched directly from backend APIs.
          </p>
        </article>
      </section>
    </AdminShell>
  );
}
