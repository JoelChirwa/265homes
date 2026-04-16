"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "../_components/AdminShell";
import { adminApiRequest } from "../_lib/api";

type SettingsResponse = {
  subscriptionFee: number;
  freeBrowsingDayEnabled: boolean;
  freeBrowsingDate: string | null;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [fee, setFee] = useState("5000");
  const [enabled, setEnabled] = useState(false);
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);

  const loadSettings = async () => {
    const response = await adminApiRequest<SettingsResponse>("/admin/settings");
    setSettings(response);
    setFee(String(response.subscriptionFee));
    setEnabled(response.freeBrowsingDayEnabled);
    setDate(response.freeBrowsingDate ?? "");
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const saveSettings = async () => {
    setBusy(true);
    try {
      await adminApiRequest("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          subscriptionFee: Number(fee),
          freeBrowsingDayEnabled: enabled,
          freeBrowsingDate: date || null,
        }),
      });
      await loadSettings();
      window.alert("Settings updated.");
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const runPromotion = async () => {
    if (!date) {
      window.alert("Select a promotion date first.");
      return;
    }
    setBusy(true);
    try {
      await adminApiRequest("/admin/promotions/free-browsing-day", {
        method: "POST",
        body: JSON.stringify({
          date,
          enabled,
        }),
      });
      await loadSettings();
      window.alert("Free browsing day configured.");
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="Settings" subtitle="Control subscription pricing and promotions.">
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Subscription Fee</h3>
          <p className="mt-1 text-sm text-slate-500">Update tenant subscription fee for the app.</p>
          <input
            value={fee}
            onChange={(event) => setFee(event.target.value)}
            type="number"
            min={1}
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Promotion: Free Browsing Day</h3>
          <p className="mt-1 text-sm text-slate-500">
            Allow tenants to browse listings free for a selected day.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <input
              id="promo-enabled"
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            <label htmlFor="promo-enabled" className="text-sm text-slate-700">
              Enable promotion
            </label>
          </div>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={busy}
            onClick={runPromotion}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
          >
            Run Promotion
          </button>
        </article>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Current App Settings</h3>
            <p className="text-sm text-slate-500">Save changes to apply them in backend config.</p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={saveSettings}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
          >
            {busy ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </section>
    </AdminShell>
  );
}
