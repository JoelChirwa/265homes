export type UserRole = "tenant" | "landlord";

export type SubscriptionStatus = "trial" | "limited" | "paid" | "unpaid";

export type User = {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string;
  listingViewsUsed: number;
  listingViewsLimit: number;
};

export type LoginPayload = {
  phone: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email?: string;
  phone: string;
  password: string;
  role: UserRole;
};

export type GPSCapture = {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  city: string;
  area: string;
  price: number;
  rooms: number;
  amenities: string[];
  images: string[];
  landlordId: string;
  landlordPhone: string;
  isDeleted: boolean;
  createdAt: string;
  gps: GPSCapture;
};

export type ListingFilters = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
};

export type NewListingPayload = {
  title: string;
  description: string;
  city: string;
  area: string;
  price: number;
  rooms: number;
  amenities: string[];
  images: string[];
  landlordPhone: string;
  gps: GPSCapture;
};
