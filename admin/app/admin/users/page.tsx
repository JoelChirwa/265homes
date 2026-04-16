"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "../_components/AdminShell";
import { adminApiRequest } from "../_lib/api";

type User = {
  id: string;
  fullName: string;
  phone: string;
  role: "tenant" | "landlord";
  status: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const response = await adminApiRequest<{ users: User[] }>("/admin/users");
      setUsers(response.users);
    }
    void loadUsers();
  }, []);

  const totals = useMemo(() => {
    const tenants = users.filter((user) => user.role === "tenant").length;
    const landlords = users.filter((user) => user.role === "landlord").length;
    return { total: users.length, tenants, landlords };
  }, [users]);

  return (
    <AdminShell title="Users" subtitle="View and support tenant and landlord accounts.">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Accounts</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{totals.total}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tenants</p>
          <p className="mt-2 text-3xl font-extrabold text-blue-700">{totals.tenants}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Landlords</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{totals.landlords}</p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Recent Users</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-2 py-2 font-semibold">Name</th>
                <th className="px-2 py-2 font-semibold">Phone</th>
                <th className="px-2 py-2 font-semibold">Role</th>
                <th className="px-2 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.phone} className="border-b border-slate-100">
                  <td className="px-2 py-3 font-medium">{user.fullName}</td>
                  <td className="px-2 py-3">{user.phone}</td>
                  <td className="px-2 py-3">{user.role === "tenant" ? "Tenant" : "Landlord"}</td>
                  <td className="px-2 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        user.status.toLowerCase() === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
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
