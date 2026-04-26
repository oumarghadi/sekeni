-- 07 ADD ACCOUNT_TYPE TO PROFILES
BEGIN;

-- Add account_type column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT CHECK (account_type IN ('seeker', 'lister')) DEFAULT 'seeker';

-- Update trigger function to handle account_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, account_type)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'account_type', 'seeker')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
