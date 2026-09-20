export type ShiftType = 'morning' | 'night';
export type ShiftStatus = 'available' | 'reserved';

export interface ShiftInfo {
  id: string; // e.g. "2026-09-20-morning"
  date: string; // "YYYY-MM-DD"
  type: ShiftType;
  label: string; // "الفترة الصباحية" | "الفترة المسائية"
  timeRange: string; // "09:00 ص - 05:00 م" | "06:00 م - 02:00 ص"
  priceIQD: number;
  status: ShiftStatus;
  bookingDetails?: BookingRecord;
}

export interface BookingRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  shift: ShiftType;
  shiftLabel: string;
  timeRange: string;
  customerName: string;
  customerPhone: string;
  guestsCount?: number;
  notes?: string;
  priceIQD: number;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
  bookedBy: 'client' | 'admin';
}

export interface PricingConfig {
  weekdayMorning: number;
  weekdayNight: number;
  weekdayFullDay: number;
  weekendMorning: number;
  weekendNight: number;
  weekendFullDay: number;
  currency: string;
}

export interface ChaletConfig {
  name: string;
  englishName: string;
  location: string;
  city: string;
  ownerWhatsApp: string; // e.g. "9647701234567"
  googleMapsUrl?: string; // Direct link to Google Maps
  adminPin: string;
  morningShiftHours: string;
  nightShiftHours: string;
}

export interface ResortImagesConfig {
  heroBanner: string; // Main Resort Banner Image
  swimmingPool: string; // Swimming Pool Image (15x8m)
  animalSanctuary: string; // Animal Sanctuary Image (100 sqm)
  kidsPlayground: string; // Kids Playground Image
  sportsRecreation: string; // Sports & Recreation Image
  outdoorBbq: string; // Outdoor BBQ Station
  adultGames: string; // Adult Games Room (Billiards, Table tennis, Air hockey, Foosball)
  masterBedrooms: string; // 2 Master Bedrooms
  villaExterior: string; // Villa Exterior & Gardens (2500 sqm)
  nightPool: string; // Night Pool & Ambience
}

export interface FacilityItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  imageUrl: string;
  shortDescription: string;
  fullDescription: string;
  specs: { label: string; value: string }[];
  features: string[];
}

export interface Amenity {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

export interface PoolSpecification {
  lengthMeters: number;
  widthMeters: number;
  depthRange: string;
  features: string[];
  kidsPool: string;
  filtration: string;
  heating: string;
  lighting: string;
}

export interface FarmAttraction {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  activities: string[];
  tag: string;
}

export interface HouseItemCategory {
  title: string;
  iconName: string;
  items: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'pool' | 'villa' | 'farm' | 'outdoor';
  imageUrl: string;
}
