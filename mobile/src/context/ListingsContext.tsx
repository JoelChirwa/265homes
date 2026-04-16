import { createContext, useContext, useMemo, useState } from "react";

import { mockListings } from "@/src/data/mockListings";
import type { Listing, ListingFilters, NewListingPayload } from "@/src/types";

type ListingsContextValue = {
  listings: Listing[];
  visibleListings: Listing[];
  selectedFilters: ListingFilters;
  setFilters: (filters: ListingFilters) => void;
  getListingById: (id: string) => Listing | undefined;
  createListing: (payload: NewListingPayload, landlordId: string) => Promise<void>;
  myListings: (landlordId: string) => Listing[];
  softDeleteListing: (listingId: string, landlordId: string) => Promise<void>;
};

const ListingsContext = createContext<ListingsContextValue | undefined>(undefined);

function applyFilters(listings: Listing[], filters: ListingFilters) {
  return listings.filter((listing) => {
    if (listing.isDeleted) {
      return false;
    }
    if (filters.city && listing.city !== filters.city) {
      return false;
    }
    if (filters.minPrice && listing.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && listing.price > filters.maxPrice) {
      return false;
    }
    if (filters.minRooms && listing.rooms < filters.minRooms) {
      return false;
    }
    return true;
  });
}

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [selectedFilters, setSelectedFilters] = useState<ListingFilters>({});

  const visibleListings = useMemo(
    () => applyFilters(listings, selectedFilters),
    [listings, selectedFilters],
  );

  const value = useMemo<ListingsContextValue>(
    () => ({
      listings,
      visibleListings,
      selectedFilters,
      setFilters: setSelectedFilters,
      getListingById: (id) => listings.find((item) => item.id === id),
      createListing: async (payload, landlordId) => {
        const nextListing: Listing = {
          id: `lst-${Date.now()}`,
          landlordId,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          ...payload,
        };
        setListings((prev) => [nextListing, ...prev]);
      },
      myListings: (landlordId) =>
        listings.filter((listing) => listing.landlordId === landlordId && !listing.isDeleted),
      softDeleteListing: async (listingId, landlordId) => {
        setListings((prev) =>
          prev.map((item) => {
            if (item.id !== listingId || item.landlordId !== landlordId) {
              return item;
            }
            return { ...item, isDeleted: true };
          }),
        );
      },
    }),
    [listings, selectedFilters, visibleListings],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error("useListings must be used within ListingsProvider");
  }
  return context;
}
