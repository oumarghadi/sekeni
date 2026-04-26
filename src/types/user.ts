export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  tier: UserTier;
  bio?: string;
  bioAr?: string;
  location?: string;
  locationAr?: string;
  createdAt: string;
  listings: number;
  savedHomes: number;
  totalViews: number;
  portfolioValue: number;
}

export type UserRole = 'buyer' | 'seller' | 'landlord' | 'contractor' | 'admin';
export type UserTier = 'standard' | 'premium' | 'curator';
