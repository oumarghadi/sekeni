-- 08 FIX ACCOUNT_TYPE TRIGGER FUNCTION
-- This migration ensures the trigger function correctly captures account_type during signup

BEGIN;

-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger function with explicit account_type handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_account_type text;
BEGIN
  -- Extract account_type from metadata, default to 'seeker'
  v_account_type := COALESCE(new.raw_user_meta_data->>'account_type', 'seeker');
  
  -- Validate account_type
  IF v_account_type NOT IN ('seeker', 'lister') THEN
    v_account_type := 'seeker';
  END IF;
  
  -- Insert the new profile with all fields including account_type
  INSERT INTO public.profiles (id, full_name, avatar_url, account_type)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    v_account_type
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger with explicit timing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the account_type column exists and has correct constraints
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'seeker';

-- Update existing records without account_type to have 'seeker' as default
UPDATE public.profiles 
SET account_type = 'seeker' 
WHERE account_type IS NULL;

-- Add constraint if it doesn't exist (ignore if already present)
DO $$ BEGIN
  ALTER TABLE public.profiles
  ADD CONSTRAINT account_type_check CHECK (account_type IN ('seeker', 'lister'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure the column is NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN account_type SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);

COMMIT;
