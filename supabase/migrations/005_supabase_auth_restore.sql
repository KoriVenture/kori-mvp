-- Kori: restore native Supabase Auth identity after the superseded external-auth bridge.
--
-- IMPORTANT:
-- 1. Back up the database first.
-- 2. Do not rewrite 004 migration history.
-- 3. This migration stops if profiles cannot map to auth.users by the SAME UUID.
-- 4. Never auto-link accounts merely because email addresses match.

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_opt_in_at timestamptz;

ALTER TABLE public.investor_profiles
  ADD COLUMN IF NOT EXISTS preferred_ticket_sizes text[] NOT NULL DEFAULT '{}';

DO $$
DECLARE
  bad_count integer;
BEGIN
  SELECT count(*)
  INTO bad_count
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = p.id
  );

  IF bad_count > 0 THEN
    RAISE EXCEPTION
      'Supabase Auth restoration stopped: % profiles do not map to auth.users by profiles.id. Reconcile those identities manually.',
      bad_count;
  END IF;
END
$$;

UPDATE public.profiles p
SET
  email = COALESCE(p.email, u.email),
  email_verified = u.email_confirmed_at IS NOT NULL,
  updated_at = now()
FROM auth.users u
WHERE u.id = p.id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE contype = 'f'
      AND conrelid = 'public.profiles'::regclass
      AND confrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_auth_users_fkey
      FOREIGN KEY (id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END
$$;

DROP INDEX IF EXISTS public.profiles_auth0_user_id_uidx;
DROP INDEX IF EXISTS public.profiles_supabase_user_id_uidx;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_primary_identity_provider_check,
  DROP COLUMN IF EXISTS auth0_user_id,
  DROP COLUMN IF EXISTS supabase_user_id,
  DROP COLUMN IF EXISTS primary_identity_provider,
  DROP COLUMN IF EXISTS auth_last_seen_at;

DROP FUNCTION IF EXISTS public.current_profile_id();
DROP FUNCTION IF EXISTS public.bootstrap_kori_identity(text);

DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles',
        'investor_profiles',
        'founder_profiles',
        'onboarding_progress',
        'agreement_acceptances',
        'startups',
        'startup_documents'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      p.policyname,
      p.schemaname,
      p.tablename
    );
  END LOOP;
END
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_own
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY investor_profiles_own
ON public.investor_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY founder_profiles_own
ON public.founder_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY onboarding_progress_own
ON public.onboarding_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY agreement_acceptances_own
ON public.agreement_acceptances
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY startups_founder_own
ON public.startups
FOR ALL
TO authenticated
USING (primary_founder_user_id = auth.uid())
WITH CHECK (primary_founder_user_id = auth.uid());

CREATE POLICY startup_documents_uploader_own
ON public.startup_documents
FOR ALL
TO authenticated
USING (uploaded_by_user_id = auth.uid())
WITH CHECK (uploaded_by_user_id = auth.uid());

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-photos', 'profile-photos', true),
  ('startup-data-room', 'startup-data-room', false)
ON CONFLICT (id)
DO UPDATE SET public = excluded.public;

-- Drop policies for the two Kori bucket namespaces, regardless of their
-- historical names, then recreate the final deterministic set.
DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        COALESCE(qual, '') ILIKE '%profile-photos%'
        OR COALESCE(qual, '') ILIKE '%startup-data-room%'
        OR COALESCE(with_check, '') ILIKE '%profile-photos%'
        OR COALESCE(with_check, '') ILIKE '%startup-data-room%'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON storage.objects',
      p.policyname
    );
  END LOOP;
END
$$;

CREATE POLICY "profile photos are readable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

CREATE POLICY "users upload own profile photo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users update own profile photo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users delete own profile photo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "founders read own data room"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "founders upload own data room"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "founders update own data room"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "founders delete own data room"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMIT;

-- REQUIRED POST-CHECKS
--
-- Must return zero:
-- select count(*)
-- from public.profiles p
-- left join auth.users u on u.id = p.id
-- where u.id is null;
--
-- Inspect policies:
-- select schemaname, tablename, policyname, roles, cmd, qual, with_check
-- from pg_policies
-- where schemaname in ('public', 'storage')
-- order by schemaname, tablename, policyname;
--
-- Must return no rows:
-- select proname
-- from pg_proc
-- where proname in ('current_profile_id', 'bootstrap_kori_identity');
