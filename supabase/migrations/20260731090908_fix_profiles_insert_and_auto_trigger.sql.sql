/*
# Fix profiles INSERT policy + auto-create profile on signup

## Problem
The `profiles` table had SELECT and UPDATE RLS policies but NO INSERT policy.
When a new user signed in via Google OAuth, AuthContext tried to INSERT a new
profile row from the client. RLS silently blocked it (no INSERT policy for
`authenticated`), so the profile stayed null forever. The app's routing logic
checks `profile` — a null profile means the user gets bounced back to /login
in a loop.

## Changes

### 1. Security — add missing INSERT policy on profiles
- New policy `profiles_insert_self`: an authenticated user can insert a row
  where `id = auth.uid()`. This is the standard self-signup pattern and lets
  the client create the profile row on first login.

### 2. Auto-create profile on signup (database trigger)
- New function `public.handle_new_user()` runs on `auth.users` INSERT.
- It inserts a row into `public.profiles` with the new user's id, email,
  and metadata (full_name, avatar). Role defaults to 'member', onboarded=false.
- This is a fallback so the profile exists even if client-side creation fails,
  and so the very first session already has a profile row to read.
- Trigger `on_auth_user_created` fires AFTER INSERT on `auth.users`.

### 3. Backfill existing auth.users without profiles
- INSERT profiles for any auth.users that don't have a matching profile row,
  using the same metadata mapping. Uses ON CONFLICT DO NOTHING for idempotency.

## Notes
- No data is lost; no columns/types changed.
- The trigger is idempotent via ON CONFLICT.
- Re-running this migration is safe (DROP IF EXISTS guard on trigger + policy).
*/

-- 1. INSERT policy for profiles (the missing piece)
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 2. Trigger function to auto-create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, photo_url, role, onboarded)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'member',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill: create profiles for any existing auth.users missing one
INSERT INTO public.profiles (id, email, full_name, photo_url, role, onboarded)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
  'member',
  false
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
