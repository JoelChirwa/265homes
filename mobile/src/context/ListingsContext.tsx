import React, { createContext, useContext, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/src/lib/api";
import { useAuth } from "@/src/context/AuthContext";
import type { Listing, ListingFilters, NewListingPayload } from "@/src/types";

type ListingsContextValue = {
  listings: Listing[];
  visibleListings: Listing[];
  selectedFilters: ListingFilters;
  setFilters: (filters: ListingFilters) => void;
  getListingById: (id: string) => Listing | undefined;
  createListing: (payload: NewListingPayload, landlordId: string) => Promise<void>;
  myListings: (landlordId: string) => Listing[];
  softDeleteListing: (listingId: string) => Promise<void>;
  updateListing: (id: string, updates: Partial<NewListingPayload>) => Promise<void>;
  refreshListings: () => Promise<void>;
  isLoading: boolean;
};

const ListingsContext = createContext<ListingsContextValue | undefined>(undefined);

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState<ListingFilters>({});

  // Fetch all active listings with caching
  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ['listings', selectedFilters],
    queryFn: () => apiRequest<{ listings: Listing[] }>('/listings', { query: selectedFilters, token })
        .then(res => res.listings),
  });

  const createMutation = useMutation({
    mutationFn: (data: { payload: NewListingPayload, landlordId: string }) => 
        apiRequest('/listings', { method: 'POST', body: { ...data.payload, landlordId: data.landlordId }, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, updates: Partial<NewListingPayload> }) => 
        apiRequest(`/listings/${data.id}`, { method: 'PUT', body: data.updates, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/listings/${id}`, { method: 'DELETE', token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  });

  const value = useMemo<ListingsContextValue>(
    () => ({
      listings,
      visibleListings: listings,
      selectedFilters,
      setFilters: setSelectedFilters,
      getListingById: (id) => listings.find((item) => item.id === id),
      createListing: async (payload, landlordId) => {
          await createMutation.mutateAsync({ payload, landlordId });
      },
      updateListing: async (id, updates) => {
          await updateMutation.mutateAsync({ id, updates });
      },
      myListings: (landlordId) =>
        listings.filter((listing) => listing.landlordId === landlordId),
      softDeleteListing: async (listingId) => {
          await deleteMutation.mutateAsync(listingId);
      },
      refreshListings: async () => { await refetch(); },
      isLoading,
    }),
    [listings, selectedFilters, isLoading, createMutation, updateMutation, deleteMutation, refetch],
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
