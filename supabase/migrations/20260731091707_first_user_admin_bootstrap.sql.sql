/*
# First user becomes admin (bootstrap admin)

## Problem
The app has an Admin area (Admin overview + Settings) gated by
`profile.role = 'admin'`. With the previous trigger every new user got
`role = 'member'`, so no one could ever reach the admin screens — the first
person to sign up should be the club admin.

## Change
- Replace `handle_new_user()` so that IF there are zero existing profiles,
  the new user is inserted with `role = 'admin'`; otherwise `role = 'member'`.
- The trigger is dropped and recreated to bind the new function.
- Safe to re-run (DROP IF EXISTS guards).

## Notes
- No data is lost. Existing profiles keep their current role.
- This only affects rows created by the trigger (new signups). Manually
  changing a role via SQL is still possible later.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role text;
BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'admin' ELSE 'member' END
    INTO assigned_role;

  INSERT INTO public.profiles (id, email, full_name, photo_url, role, onboarded)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    assigned_role,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
