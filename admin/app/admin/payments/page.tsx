"use client";

import { AdminShell } from "../_components/AdminShell";
import { adminApiRequest } from "../_lib/api";
import { useEffect, useMemo, useState } from "react";

type Payment = {
  reference: string;
  userId: string;
  phone: string;
  amount: number;
  status: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [manualUserId, setManualUserId] = useState("");
  const [reason, setReason] = useState("Customer paid but activation failed.");
  const [busy, setBusy] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await adminApiRequest<{ payments: Payment[] }>("/admin/payments");
      setPayments(response.payments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  const summary = useMemo(() => {
    const total = payments.length;
    const success = payments.filter((p) =>
      ["success", "successful", "paid", "completed", "resolved_manually"].includes(
        p.status.toLowerCase(),
      ),
    ).length;
    const pending = payments.filter((p) => p.status.toLowerCase().includes("pending")).length;
    const failed = Math.max(0, total - success - pending);
    return { total, success, pending, failed };
  }, [payments]);

  const resolvePayment = async () => {
    if (!manualUserId) {
      return;
    }
    setBusy(true);
    try {
      await adminApiRequest("/admin/payments/resolve", {
        method: "POST",
        body: JSON.stringify({
          userId: manualUserId,
          reference: selected || null,
          reason,
        }),
      });
      setManualUserId("");
      setSelected("");
      await loadPayments();
      window.alert("Payment issue resolved and subscription activated.");
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="Payments" subtitle="Track subscription transactions and payment health.">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Transactions</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{summary.total}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Success</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{summary.success}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-600">{summary.pending}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Failed</p>
          <p className="mt-2 text-3xl font-extrabold text-red-600">{summary.failed}</p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Resolve Payment Activation Issues</h3>
        <p className="mt-1 text-sm text-slate-500">
          Use this when payment was made but subscription was not activated.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            placeholder="User ID"
            value={manualUserId}
            onChange={(event) => setManualUserId(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Reference (optional)"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
          />
        </div>
        <button
          type="button"
          onClick={resolvePayment}
          disabled={busy}
          className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          {busy ? "Resolving..." : "Resolve & Activate Subscription"}
        </button>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-2 py-2 font-semibold">Transaction</th>
                <th className="px-2 py-2 font-semibold">Phone</th>
                <th className="px-2 py-2 font-semibold">Method</th>
                <th className="px-2 py-2 font-semibold">Amount</th>
                <th className="px-2 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-2 py-3 text-slate-500" colSpan={5}>
                    Loading transactions...
                  </td>
                </tr>
              ) : null}
              {!loading && payments.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-500" colSpan={5}>
                    No transactions found.
                  </td>
                </tr>
              ) : null}
              {payments.map((tx) => (
                <tr key={tx.reference} className="border-b border-slate-100">
                  <td className="px-2 py-3 font-medium">{tx.reference}</td>
                  <td className="px-2 py-3">{tx.phone}</td>
                  <td className="px-2 py-3">Mobile Money</td>
                  <td className="px-2 py-3">MWK {tx.amount.toLocaleString()}</td>
                  <td className="px-2 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        tx.status.toLowerCase().includes("success") ||
                        tx.status.toLowerCase() === "resolved_manually"
                          ? "bg-emerald-100 text-emerald-700"
                          : tx.status.toLowerCase().includes("pending")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tx.status}
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
