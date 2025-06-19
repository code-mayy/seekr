/*
  # Fix user signup by creating automatic profile creation

  1. Database Function
    - Creates `handle_new_user()` function that automatically inserts a profile record
    - Populates required fields from auth.users data
    - Sets default values for optional fields

  2. Database Trigger
    - Creates trigger on auth.users table
    - Automatically calls handle_new_user() after user signup
    - Ensures every new user gets a corresponding profile entry

  3. Security
    - Function runs with security definer privileges
    - Handles the automatic profile creation securely
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    bio,
    contact_details,
    visibility_preferences,
    notification_settings
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULL,
    '',
    '{}',
    '{"email_visible": false, "profile_public": true, "contact_visible": true}',
    '{"marketing": false, "new_matches": true, "listing_updates": true, "email_notifications": true}'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();