"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "../_components/AdminShell";
import { adminApiRequest } from "../_lib/api";

type Renewal = {
  tenant: string;
  phone: string;
  renewalDate: string;
  status: string;
};

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([
    { plan: "Paid Subscribers", count: "0" },
    { plan: "Unpaid Tenants", count: "0" },
    { plan: "Landlords (Free)", count: "0" },
  ]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [weeklyFee, setWeeklyFee] = useState("5000");
  const [monthlyFee, setMonthlyFee] = useState("20000");
  const [busy, setBusy] = useState(false);

  const loadOverview = async () => {
    const response = await adminApiRequest<{
      plans: { paidSubscribers: number; unpaidTenants: number; landlordsFree: number };
      fees: { weekly: number; monthly: number };
      renewals: Renewal[];
    }>("/admin/subscriptions/overview");

    setPlans([
      { plan: "Paid Subscribers", count: String(response.plans.paidSubscribers) },
      { plan: "Unpaid Tenants", count: String(response.plans.unpaidTenants) },
      { plan: "Landlords (Free)", count: String(response.plans.landlordsFree) },
    ]);
    setWeeklyFee(String(response.fees.weekly));
    setMonthlyFee(String(response.fees.monthly));
    setRenewals(response.renewals);
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const saveFees = async () => {
    setBusy(true);
    try {
      await adminApiRequest("/admin/subscriptions/fees", {
        method: "PUT",
        body: JSON.stringify({
          weekly: Number(weeklyFee),
          monthly: Number(monthlyFee),
        }),
      });
      await loadOverview();
      window.alert("Subscription fees updated.");
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell
      title="Subscriptions"
      subtitle="Monitor tenant subscriptions and landlord free access."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((item) => (
          <article key={item.plan} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.plan}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{item.count}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Subscription Fee Setup</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            type="number"
            min={1}
            value={weeklyFee}
            onChange={(event) => setWeeklyFee(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Weekly Fee (MWK)"
          />
          <input
            type="number"
            min={1}
            value={monthlyFee}
            onChange={(event) => setMonthlyFee(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Monthly Fee (MWK)"
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={saveFees}
          className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          {busy ? "Saving..." : "Save Fees"}
        </button>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Upcoming Renewals</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-2 py-2 font-semibold">Tenant</th>
                <th className="px-2 py-2 font-semibold">Phone</th>
                <th className="px-2 py-2 font-semibold">Renewal Date</th>
                <th className="px-2 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {renewals.map((renewal) => (
                <tr key={`${renewal.phone}-${renewal.renewalDate}`} className="border-b border-slate-100">
                  <td className="px-2 py-3 font-medium">{renewal.tenant}</td>
                  <td className="px-2 py-3">{renewal.phone}</td>
                  <td className="px-2 py-3">{renewal.renewalDate}</td>
                  <td className="px-2 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        renewal.status === "Upcoming"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {renewal.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
