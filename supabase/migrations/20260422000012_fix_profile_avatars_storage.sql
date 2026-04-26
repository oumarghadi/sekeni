-- 12 FIX: profile avatars storage policies
-- Allows authenticated users to upload/update their avatar
-- and public clients to read avatars from the 'profiles' bucket.

DROP POLICY IF EXISTS "Public can view profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete profile avatars" ON storage.objects;

CREATE POLICY "Public can view profile avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

CREATE POLICY "Authenticated users can upload profile avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profiles'
    AND auth.uid()::text = split_part(split_part(name, '/', 2), '.', 1)
  );

CREATE POLICY "Owners can update profile avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profiles'
    AND auth.uid()::text = split_part(split_part(name, '/', 2), '.', 1)
  )
  WITH CHECK (
    bucket_id = 'profiles'
    AND auth.uid()::text = split_part(split_part(name, '/', 2), '.', 1)
  );

CREATE POLICY "Owners can delete profile avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profiles'
    AND auth.uid()::text = split_part(split_part(name, '/', 2), '.', 1)
  );
