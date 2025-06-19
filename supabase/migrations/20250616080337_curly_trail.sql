/*
  # Complete Database Schema Setup

  1. New Tables
    - `profiles` - User profile information with contact details and preferences
    - `listings` - User-created item requests with images and metadata
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public viewing of active listings
    - Storage policies for secure file uploads
  
  3. Functions & Triggers
    - Auto-create profiles when users sign up
    - Auto-update timestamps on record changes
    - Function to increment listing view counts
  
  4. Storage
    - Create buckets for listing images and avatars
    - Set up secure upload/access policies
*/

-- First, ensure we have the auth schema available
-- Create profiles table with all columns
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  username text UNIQUE,
  bio text DEFAULT '',
  avatar_url text,
  contact_details jsonb DEFAULT '{}',
  visibility_preferences jsonb DEFAULT '{"profile_public": true, "email_visible": false, "contact_visible": true}',
  notification_settings jsonb DEFAULT '{"email_notifications": true, "listing_updates": true, "new_matches": true, "marketing": false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns if table already exists
DO $$
BEGIN
  -- Add bio column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text DEFAULT '';
  END IF;

  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;

  -- Add contact_details column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'contact_details'
  ) THEN
    ALTER TABLE profiles ADD COLUMN contact_details jsonb DEFAULT '{}';
  END IF;

  -- Add visibility_preferences column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'visibility_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN visibility_preferences jsonb DEFAULT '{"profile_public": true, "email_visible": false, "contact_visible": true}';
  END IF;

  -- Add notification_settings column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'notification_settings'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notification_settings jsonb DEFAULT '{"email_notifications": true, "listing_updates": true, "new_matches": true, "marketing": false}';
  END IF;
END $$;

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  max_budget integer NOT NULL DEFAULT 0,
  preferred_condition text NOT NULL,
  location text NOT NULL,
  additional_notes text DEFAULT '',
  images jsonb DEFAULT '[]',
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  views_count integer DEFAULT 0,
  favorites_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Safely drop and recreate policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Drop all existing policies on profiles table
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON profiles';
  END LOOP;

  -- Drop all existing policies on listings table
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'listings'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON listings';
  END LOOP;
END $$;

-- Create profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Only create public profile policy if visibility_preferences column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'visibility_preferences'
  ) THEN
    EXECUTE 'CREATE POLICY "Public profiles are viewable by everyone"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (
        visibility_preferences->>''profile_public'' = ''true''
      )';
  END IF;
END $$;

-- Create listings policies
CREATE POLICY "Users can manage own listings"
  ON listings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Active listings are viewable by everyone"
  ON listings
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DO $$
BEGIN
  -- Drop trigger if it exists
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  -- Create new trigger
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
END $$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create timestamp update triggers
DO $$
BEGIN
  -- Drop existing triggers
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
  
  -- Create new triggers
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
  CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Function to increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET views_count = views_count + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create storage buckets
DO $$
BEGIN
  -- Create listing-images bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('listing-images', 'listing-images', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Create avatars bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN others THEN
    -- Ignore errors if storage schema doesn't exist yet
    NULL;
END $$;

-- Create storage policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Only proceed if storage.objects table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'storage' AND table_name = 'objects'
  ) THEN
    
    -- Drop existing storage policies
    FOR policy_record IN 
      SELECT policyname FROM pg_policies 
      WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname LIKE '%listing%' OR policyname LIKE '%avatar%'
    LOOP
      EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
    END LOOP;

    -- Create new storage policies
    CREATE POLICY "Users can upload listing images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'listing-images');

    CREATE POLICY "Users can view listing images"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'listing-images');

    CREATE POLICY "Users can delete own listing images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Users can upload avatars"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'avatars');

    CREATE POLICY "Users can view avatars"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'avatars');

    CREATE POLICY "Users can delete own avatars"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
EXCEPTION
  WHEN others THEN
    -- Ignore errors if storage policies can't be created
    NULL;
END $$;