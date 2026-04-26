-- 10 FIX: listing_images RLS + Storage bucket policies
-- Root cause: FOR ALL USING does not guarantee WITH CHECK for INSERT.
-- Splitting into explicit per-operation policies fixes the RLS violation.

-- ── listing_images table ──

DROP POLICY IF EXISTS "Owners can manage own images" ON public.listing_images;

CREATE POLICY "Anyone can view listing images"
  ON public.listing_images FOR SELECT USING (true);

CREATE POLICY "Owners can insert listing images"
  ON public.listing_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update listing images"
  ON public.listing_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete listing images"
  ON public.listing_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND owner_id = auth.uid()
    )
  );

-- ── Storage bucket 'listings' ──
-- Run after creating the bucket manually in Supabase Dashboard > Storage

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listings');

CREATE POLICY "Public can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');

CREATE POLICY "Owners can delete their images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
