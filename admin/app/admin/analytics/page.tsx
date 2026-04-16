"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "../_components/AdminShell";
import { adminApiRequest } from "../_lib/api";

export default function AnalyticsPage() {
  const [growthKpis, setGrowthKpis] = useState<
    Array<{ label: string; value: string; note: string }>
  >([]);
  const [cityPerformance, setCityPerformance] = useState<
    Array<{ city: string; activeUsers: number; conversions: string }>
  >([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      const response = await adminApiRequest<{
        growthKpis: Array<{ label: string; value: string; note: string }>;
        cityPerformance: Array<{ city: string; activeUsers: number; conversions: string }>;
        insights: string[];
      }>("/admin/analytics");
      setGrowthKpis(response.growthKpis);
      setCityPerformance(response.cityPerformance);
      setInsights(response.insights);
    }

    void loadAnalytics();
  }, []);

  return (
    <AdminShell
      title="Analytics"
      subtitle="Understand platform growth, adoption and subscription conversion."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {growthKpis.map((kpi) => (
          <article key={kpi.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{kpi.value}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">{kpi.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900">City Performance</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-2 py-2 font-semibold">City</th>
                  <th className="px-2 py-2 font-semibold">Active Users</th>
                  <th className="px-2 py-2 font-semibold">Paid Conversion</th>
                </tr>
              </thead>
              <tbody>
                {cityPerformance.map((city) => (
                  <tr key={city.city} className="border-b border-slate-100">
                    <td className="px-2 py-3 font-medium">{city.city}</td>
                    <td className="px-2 py-3">{city.activeUsers}</td>
                    <td className="px-2 py-3">{city.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Insights</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            {insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </article>
      </section>
    </AdminShell>
  );
}
