"use client";

import { useState } from "react";

import { AdminShell } from "../_components/AdminShell";
import { adminApiRequest } from "../_lib/api";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userIdsRaw, setUserIdsRaw] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const userIds = userIdsRaw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!title || !message || userIds.length === 0) {
      window.alert("Provide title, message, and at least one user ID.");
      return;
    }

    setBusy(true);
    try {
      await adminApiRequest("/admin/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          title,
          message,
          userIds,
          type: "admin",
        }),
      });
      setTitle("");
      setMessage("");
      setUserIdsRaw("");
      window.alert("Notification sent successfully.");
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell
      title="Notifications"
      subtitle="Send operational notifications to mobile app users."
    >
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Send Mobile Notification</h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter one or more user IDs (comma-separated) to send app notifications.
        </p>

        <div className="mt-4 grid gap-3">
          <input
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Target user IDs (e.g. usr-1001, usr-1002)"
            value={userIdsRaw}
            onChange={(event) => setUserIdsRaw(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={send}
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          {busy ? "Sending..." : "Send Notification"}
        </button>
      </section>
    </AdminShell>
  );
}
