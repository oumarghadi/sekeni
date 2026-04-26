-- 03 LISTINGS & MEDIA

-- Main Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    city_id uuid REFERENCES public.cities(id),
    category_id uuid REFERENCES public.property_categories(id),
    
    listing_type text NOT NULL CHECK (listing_type IN ('property', 'construction_service')),
    operation_type text NOT NULL CHECK (operation_type IN ('buy', 'rent', 'build')),
    
    title text NOT NULL,
    description text,
    address_text text,
    
    price numeric NOT NULL DEFAULT 0,
    currency_code text DEFAULT 'MRU',
    
    status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'pending')),
    is_featured boolean DEFAULT false,
    contact_phone text,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Listing Images
CREATE TABLE IF NOT EXISTS public.listing_images (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
    storage_path text NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Property Specific Details
CREATE TABLE IF NOT EXISTS public.property_details (
    listing_id uuid PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
    area_sqm numeric,
    rooms_count integer,
    bathrooms_count integer,
    furnishing_status text,
    property_condition text,
    has_parking boolean DEFAULT false,
    has_garden boolean DEFAULT false,
    has_pool boolean DEFAULT false,
    latitude double precision,
    longitude double precision
);

-- Construction Service Specific Details
CREATE TABLE IF NOT EXISTS public.construction_service_details (
    listing_id uuid PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
    service_type text,
    estimated_duration text,
    budget_min numeric,
    budget_max numeric
);

-- Triggers for updated_at
CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_service_details ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public listings are viewable by everyone" ON public.listings FOR SELECT USING (status = 'published');
CREATE POLICY "Users can manage own listings" ON public.listings FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Images are viewable by everyone" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "Owners can manage own images" ON public.listing_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND owner_id = auth.uid())
);

CREATE POLICY "Details are viewable by everyone" ON public.property_details FOR SELECT USING (true);
CREATE POLICY "Owners can manage own property details" ON public.property_details FOR ALL USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND owner_id = auth.uid())
);

CREATE POLICY "Service details are viewable by everyone" ON public.construction_service_details FOR SELECT USING (true);
CREATE POLICY "Owners can manage own service details" ON public.construction_service_details FOR ALL USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND owner_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_listings_owner ON public.listings(owner_id);
CREATE INDEX idx_listings_city ON public.listings(city_id);
CREATE INDEX idx_listings_type ON public.listings(listing_type, operation_type);
CREATE INDEX idx_listings_status ON public.listings(status);
