-- 01 LOOKUP TABLES (CITIES & CATEGORIES)

-- Cities Table
CREATE TABLE IF NOT EXISTS public.cities (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_fr text NOT NULL,
    name_ar text NOT NULL,
    slug text UNIQUE NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Property Categories Table
CREATE TABLE IF NOT EXISTS public.property_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_fr text NOT NULL,
    name_ar text NOT NULL,
    slug text UNIQUE NOT NULL,
    icon_name text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS (Read-only for public)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Categories are viewable by everyone" ON public.property_categories FOR SELECT USING (true);
