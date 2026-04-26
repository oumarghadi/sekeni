import { supabase } from './supabase';

// ---------- Types matching the Supabase schema ----------

export interface ListingImage {
  storage_path: string;
  sort_order: number;
}

export interface ListingPropertyDetails {
  area_sqm: number | null;
  rooms_count: number | null;
  bathrooms_count: number | null;
  has_parking: boolean | null;
}

export interface ListingServiceDetails {
  service_type: string | null;
  estimated_duration: string | null;
  budget_min: number | null;
  budget_max: number | null;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  address_text: string | null;
  price: number;
  currency_code: string;
  operation_type: 'buy' | 'rent' | 'build';
  listing_type: 'property' | 'construction_service';
  is_featured: boolean;
  created_at: string;
  cities: { name_ar: string } | null;
  listing_images: ListingImage[];
  property_details: ListingPropertyDetails | null;
  construction_service_details: ListingServiceDetails | null;
}

export interface FetchListingsOptions {
  operationType?: 'buy' | 'rent' | 'build';
  listingType?: 'property' | 'construction_service';
  limit?: number;
  maxPrice?: number;
  minPrice?: number;
  categoryId?: string;
}

// ---------- Fetch function ----------

export async function fetchListings(
  options: FetchListingsOptions = {}
): Promise<{ data: Listing[]; error: string | null }> {
  let query = supabase
    .from('listings')
    .select(`
      id,
      title,
      description,
      address_text,
      price,
      currency_code,
      operation_type,
      listing_type,
      is_featured,
      created_at,
      cities ( name_ar ),
      listing_images ( storage_path, sort_order ),
      property_details ( area_sqm, rooms_count, bathrooms_count, has_parking ),
      construction_service_details ( service_type, estimated_duration, budget_min, budget_max )
    `)
    .eq('status', 'published')
    .eq('listing_type', options.listingType ?? 'property')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 20);

  if (options.operationType) {
    query = query.eq('operation_type', options.operationType);
  }

  if (options.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options.minPrice !== undefined) {
    query = query.gte('price', options.minPrice);
  }

  if (options.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  // Transform data to match Listing interface
  const transformedData = (data as any[])?.map(item => {
    const rawDetails = item.property_details;
    const details = Array.isArray(rawDetails)
      ? (rawDetails.length > 0 ? rawDetails[0] : null)
      : rawDetails;

    return {
      ...item,
      cities: Array.isArray(item.cities) && item.cities.length > 0 ? item.cities[0] : item.cities,
      listing_images: item.listing_images || [],
      property_details: details,
      construction_service_details: Array.isArray(item.construction_service_details) && item.construction_service_details.length > 0 
        ? item.construction_service_details[0] 
        : item.construction_service_details,
    };
  }) ?? [];

  return { data: transformedData as Listing[], error: null };
}

// ---------- Helpers ----------

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop';

export function getListingImageUrl(storagePath: string): string {
  if (storagePath.startsWith('http')) return storagePath;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return `${supabaseUrl}/storage/v1/object/public/listings/${storagePath}`;
}

export function getFirstImage(images: ListingImage[]): string {
  if (!images || images.length === 0) return FALLBACK_IMAGE;
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  return getListingImageUrl(sorted[0].storage_path);
}

export const operationTypeLabel: Record<Listing['operation_type'], string> = {
  buy: 'للبيع',
  rent: 'للإيجار',
  build: 'للبناء',
};

export const operationTypeBadgeVariant: Record<
  Listing['operation_type'],
  'info' | 'tertiary' | 'success'
> = {
  buy: 'info',
  rent: 'tertiary',
  build: 'success',
};
