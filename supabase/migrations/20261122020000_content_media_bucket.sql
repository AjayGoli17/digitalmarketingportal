-- ====================================================================
-- CONTENT MEDIA STORAGE BUCKET
-- Public bucket for uploaded content images (agency content creation
-- flow). There is no login yet, so anon and authenticated roles share
-- the same access.
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-media',
  'content-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Anon/auth can view content-media objects"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'content-media');

CREATE POLICY "Anon/auth can upload content-media objects"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'content-media');

CREATE POLICY "Anon/auth can update content-media objects"
    ON storage.objects FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'content-media')
    WITH CHECK (bucket_id = 'content-media');
