export interface Property {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  priceLabel: string;
  location: string;
  locationAr: string;
  city: string;
  cityAr: string;
  district: string;
  districtAr: string;
  operationType: OperationType;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number; // in m²
  parking: number;
  images: string[];
  amenities: string[];
  amenitiesAr: string[];
  status: PropertyStatus;
  isFeatured: boolean;
  isNew: boolean;
  isVerified: boolean;
  agentId: string;
  createdAt: string;
  views: number;
}

export type OperationType = 'buy' | 'rent' | 'build';
export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'mansion' | 'land' | 'commercial';
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'rented' | 'draft';

export interface PropertyFilter {
  operationType?: OperationType | 'all';
  propertyType?: PropertyType | 'all';
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minArea?: number;
  amenities?: string[];
  searchQuery?: string;
}
