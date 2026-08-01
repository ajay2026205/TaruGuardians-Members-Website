/*
# Open all tables for anon access (demo mode)

## Purpose
Google OAuth is not yet configured in Supabase, so no user can sign in.
This migration opens all tables for the `anon` role so the app works
without authentication (demo mode). Auth can be re-enabled later by
reverting these policies.

## Changes
1. Drop the FK constraint on profiles.id → auth.users(id) so a demo
   profile can be seeded without an auth user.
2. Add `TO anon, authenticated` policies with `USING (true)` on every
   table for all CRUD operations.
3. Existing authenticated policies are kept — they'll be used again
   once auth is re-enabled.

## Security notes
- This is intentionally open for demo mode. Revert before production.
- No data is lost. Existing policies remain.
*/

-- 1. Remove FK so we can seed a demo profile
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. helper: drop-if-exists + create anon-open policy for a table
--    We create 4 CRUD policies per table, scoped to anon, authenticated.

-- profiles
DROP POLICY IF EXISTS "anon_profiles_select" ON public.profiles;
CREATE POLICY "anon_profiles_select" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_profiles_insert" ON public.profiles;
CREATE POLICY "anon_profiles_insert" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_profiles_update" ON public.profiles;
CREATE POLICY "anon_profiles_update" ON public.profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_profiles_delete" ON public.profiles;
CREATE POLICY "anon_profiles_delete" ON public.profiles FOR DELETE TO anon, authenticated USING (true);

-- content
DROP POLICY IF EXISTS "anon_content_select" ON public.content;
CREATE POLICY "anon_content_select" ON public.content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_content_insert" ON public.content;
CREATE POLICY "anon_content_insert" ON public.content FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_content_update" ON public.content;
CREATE POLICY "anon_content_update" ON public.content FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_content_delete" ON public.content;
CREATE POLICY "anon_content_delete" ON public.content FOR DELETE TO anon, authenticated USING (true);

-- tasks
DROP POLICY IF EXISTS "anon_tasks_select" ON public.tasks;
CREATE POLICY "anon_tasks_select" ON public.tasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_tasks_insert" ON public.tasks;
CREATE POLICY "anon_tasks_insert" ON public.tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_tasks_update" ON public.tasks;
CREATE POLICY "anon_tasks_update" ON public.tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_tasks_delete" ON public.tasks;
CREATE POLICY "anon_tasks_delete" ON public.tasks FOR DELETE TO anon, authenticated USING (true);

-- messages
DROP POLICY IF EXISTS "anon_messages_select" ON public.messages;
CREATE POLICY "anon_messages_select" ON public.messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_messages_insert" ON public.messages;
CREATE POLICY "anon_messages_insert" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_messages_update" ON public.messages;
CREATE POLICY "anon_messages_update" ON public.messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- notifications
DROP POLICY IF EXISTS "anon_notifications_select" ON public.notifications;
CREATE POLICY "anon_notifications_select" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_notifications_insert" ON public.notifications;
CREATE POLICY "anon_notifications_insert" ON public.notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_notifications_update" ON public.notifications;
CREATE POLICY "anon_notifications_update" ON public.notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_notifications_delete" ON public.notifications;
CREATE POLICY "anon_notifications_delete" ON public.notifications FOR DELETE TO anon, authenticated USING (true);

-- schedule
DROP POLICY IF EXISTS "anon_schedule_select" ON public.schedule;
CREATE POLICY "anon_schedule_select" ON public.schedule FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_schedule_insert" ON public.schedule;
CREATE POLICY "anon_schedule_insert" ON public.schedule FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_schedule_update" ON public.schedule;
CREATE POLICY "anon_schedule_update" ON public.schedule FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_schedule_delete" ON public.schedule;
CREATE POLICY "anon_schedule_delete" ON public.schedule FOR DELETE TO anon, authenticated USING (true);

-- app_settings
DROP POLICY IF EXISTS "anon_settings_select" ON public.app_settings;
CREATE POLICY "anon_settings_select" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_settings_update" ON public.app_settings;
CREATE POLICY "anon_settings_update" ON public.app_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
