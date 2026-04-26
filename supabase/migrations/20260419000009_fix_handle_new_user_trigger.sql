-- 09 FIX handle_new_user TRIGGER TO INCLUDE account_type
-- Root cause: migration 02 created a trigger that does NOT insert account_type.
-- Columns added later (migration 07/08) have DEFAULT 'seeker', so all new users
-- were silently defaulting to seeker regardless of what they selected at signup.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_account_type text;
BEGIN
  v_account_type := COALESCE(new.raw_user_meta_data->>'account_type', 'seeker');

  IF v_account_type NOT IN ('seeker', 'lister') THEN
    v_account_type := 'seeker';
  END IF;

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
