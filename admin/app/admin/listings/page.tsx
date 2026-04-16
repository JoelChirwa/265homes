"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "../_components/AdminShell";
import { adminApiRequest } from "../_lib/api";

type Listing = {
  id: string;
  title: string;
  landlordId: string;
  status: string;
  securedAt: string | null;
  deletedAt: string | null;
  purgeAt: string | null;
};

export default function ListingsOpsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const loadListings = async () => {
    setLoading(true);
    try {
      const response = await adminApiRequest<{ listings: Listing[] }>("/admin/listings");
      setListings(response.listings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadListings();
  }, []);

  const secureListing = async (listingId: string, action: "notify_delete" | "delete_now") => {
    setBusyId(listingId + action);
    try {
      await adminApiRequest(`/admin/listings/${listingId}/secure`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      await loadListings();
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setBusyId("");
    }
  };

  const repostListing = async (listingId: string) => {
    setBusyId(listingId + "repost");
    try {
      await adminApiRequest(`/admin/listings/${listingId}/repost`, { method: "POST" });
      await loadListings();
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <AdminShell
      title="Listings Operations"
      subtitle="Handle secured listings with landlord notification and 48-hour retention rules."
    >
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Secured Listing Workflow</h3>
        <p className="mt-2 text-sm text-slate-600">
          Admin can notify landlord to delete or delete directly. Deleted records remain for 48
          hours before permanent purge.
        </p>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Listings</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-2 py-2 font-semibold">ID</th>
                <th className="px-2 py-2 font-semibold">Title</th>
                <th className="px-2 py-2 font-semibold">Landlord</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 font-semibold">Purge At</th>
                <th className="px-2 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-2 py-3 text-slate-500" colSpan={6}>
                    Loading listings...
                  </td>
                </tr>
              ) : null}
              {!loading && listings.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-500" colSpan={6}>
                    No listings available.
                  </td>
                </tr>
              ) : null}
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-slate-100">
                  <td className="px-2 py-3 font-medium">{listing.id}</td>
                  <td className="px-2 py-3">{listing.title}</td>
                  <td className="px-2 py-3">{listing.landlordId}</td>
                  <td className="px-2 py-3">{listing.status}</td>
                  <td className="px-2 py-3">{listing.purgeAt ?? "-"}</td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === listing.id + "notify_delete"}
                        onClick={() => secureListing(listing.id, "notify_delete")}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
                      >
                        Notify Landlord
                      </button>
                      <button
                        type="button"
                        disabled={busyId === listing.id + "delete_now"}
                        onClick={() => secureListing(listing.id, "delete_now")}
                        className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                      >
                        Delete for 48h Retention
                      </button>
                      {listing.status === "deleted_pending_purge" ? (
                        <button
                          type="button"
                          disabled={busyId === listing.id + "repost"}
                          onClick={() => repostListing(listing.id)}
                          className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
                        >
                          Repost
                        </button>
                      ) : null}
                    </div>
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
