-- ============================================
-- STORAGE & PRODUCTS FIX MIGRATION SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add 'images' column to products table (for multiple product images)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Add 'description' column if missing (ensure it exists)
-- This is already in schema but ensuring it's there
-- ALTER TABLE public.products ALTER COLUMN description SET DEFAULT '';

-- 3. Create the storage bucket for product images
-- Note: Storage buckets are created via Supabase Dashboard or API
-- Run this in Supabase Dashboard > Storage > Create a new bucket
-- Bucket name: 'images'
-- Make it PUBLIC

-- 4. Storage RLS Policies for 'images' bucket
-- These policies allow anyone to read images and authenticated users to upload

-- Policy: Allow public read access to images
CREATE POLICY "Public Image Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy: Allow anyone to upload (since we use anon key)
CREATE POLICY "Allow Image Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Policy: Allow anyone to update their uploads
CREATE POLICY "Allow Image Updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

-- Policy: Allow anyone to delete uploads
CREATE POLICY "Allow Image Deletion"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');

-- 5. Ensure products table has all required columns for admin product creation
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Gadgets';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 50;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;

-- 6. Grant permissions
GRANT ALL ON public.products TO anon, authenticated, service_role;
GRANT ALL ON storage.objects TO anon, authenticated, service_role;

-- ============================================
-- INSTRUCTIONS FOR SUPABASE DASHBOARD:
-- ============================================
-- 
-- STEP 1: Create Storage Bucket
-- Go to: Storage > New Bucket
-- Name: images
-- Check: "Make this bucket public"
-- Click: Create bucket
--
-- STEP 2: Run this SQL script
-- Go to: SQL Editor
-- Paste and run this entire script
--
-- STEP 3: Verify
-- After running, check that:
-- - products table has 'images' column
-- - Storage bucket 'images' exists and is public
--
-- ============================================
