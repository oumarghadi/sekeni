-- 06 ARCHITECTURAL PIVOT: FLEXIBLE ROLES & DUAL-FLOW
BEGIN;

-- 1. Updates specifically for PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_seeker BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_lister BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS seeker_interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS lister_specialties TEXT[] DEFAULT '{}';

-- Remove the old rigid constraint on preferred_role if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_preferred_role_check;

-- 2. Updates for LISTINGS
-- We refine the intent/operation types to be more descriptive
-- Existing: buy, rent, build
-- We ensure they cover all cases from the new design

-- Ensure listing_type constraint is robust
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_listing_type_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_listing_type_check 
CHECK (listing_type IN ('property', 'construction_service'));

-- Ensure operation_type constraint aligns with: Buy, Rent, Build (Seeker) / Sell, Rent, Offer (Lister)
-- Note: 'buy' for seeker maps to 'sell' for lister. We use the Seeker's intent as the primary key for operation_type.
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_operation_type_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_operation_type_check 
CHECK (operation_type IN ('buy', 'rent', 'build'));

-- 3. Add a helper column for "Lister Intent" to make it easier for the UI
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS lister_intent TEXT CHECK (lister_intent IN ('sell', 'rent', 'offer_service'));

COMMIT;
