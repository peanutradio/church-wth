-- Add last_login column to profiles table for activity tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;

-- Create function to update last_login on user login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update last_login
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();

-- Update existing profiles to set initial last_login from auth.users
UPDATE public.profiles p
SET last_login = (
  SELECT last_sign_in_at
  FROM auth.users u
  WHERE u.id = p.id
)
WHERE last_login IS NULL;
