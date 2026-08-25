-- ============================================================================
-- Kori + Auth0 + Supabase
-- Non-destructive identity migration for the Kori MVP
--
-- Goal:
--   Auth0    = authentication / identity / social / OTP / passkeys / MFA / B2B
--   Supabase = PostgreSQL / RLS / Storage / Realtime
--
-- IMPORTANT:
-- - Run this only AFTER the previous Kori onboarding migration has succeeded.
-- - Take a backup before running it.
-- - This migration deliberately keeps profiles.id as Kori's internal UUID.
-- - It DOES NOT automatically merge Auth0 and existing Supabase users by email.
-- - It DOES NOT touch downstream community/deal/wallet/diligence/capital tables.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 0. PRE-FLIGHT
-- ============================================================================

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'Required table public.profiles does not exist.';
  END IF;

  IF to_regclass('public.investor_profiles') IS NULL THEN
    RAISE EXCEPTION 'Required table public.investor_profiles does not exist.';
  END IF;

  IF to_regclass('public.startups') IS NULL THEN
    RAISE EXCEPTION 'Required table public.startups does not exist.';
  END IF;

  IF to_regclass('public.founder_profiles') IS NULL THEN
    RAISE EXCEPTION 'Required table public.founder_profiles does not exist.';
  END IF;

  IF to_regclass('public.onboarding_progress') IS NULL THEN
    RAISE EXCEPTION 'Required table public.onboarding_progress does not exist.';
  END IF;

  IF to_regclass('public.agreement_acceptances') IS NULL THEN
    RAISE EXCEPTION 'Required table public.agreement_acceptances does not exist.';
  END IF;

  IF to_regclass('public.startup_documents') IS NULL THEN
    RAISE EXCEPTION 'Required table public.startup_documents does not exist.';
  END IF;
END
$$;

-- ============================================================================
-- 1. DECOUPLE THE KORI PROFILE FROM SUPABASE AUTH
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS auth0_user_id text,
  ADD COLUMN IF NOT EXISTS supabase_user_id uuid,
  ADD COLUMN IF NOT EXISTS primary_identity_provider text NOT NULL DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auth_last_seen_at timestamptz;

UPDATE public.profiles p
SET
  supabase_user_id = p.id,
  primary_identity_provider = COALESCE(NULLIF(p.primary_identity_provider, ''), 'supabase')
WHERE p.supabase_user_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = p.id
  );

UPDATE public.profiles p
SET
  email = COALESCE(p.email, u.email),
  email_verified = CASE
    WHEN u.email_confirmed_at IS NOT NULL THEN true
    ELSE p.email_verified
  END
FROM auth.users u
WHERE p.supabase_user_id = u.id;

-- Remove ONLY the FK(s) from public.profiles to auth.users.
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE contype = 'f'
      AND conrelid = 'public.profiles'::regclass
      AND confrelid = 'auth.users'::regclass
  LOOP
    EXECUTE format(
      'ALTER TABLE public.profiles DROP CONSTRAINT %I',
      c.conname
    );
  END LOOP;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_auth0_user_id_uidx
  ON public.profiles(auth0_user_id)
  WHERE auth0_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_supabase_user_id_uidx
  ON public.profiles(supabase_user_id)
  WHERE supabase_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_email_lower_idx
  ON public.profiles(lower(email))
  WHERE email IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_primary_identity_provider_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_primary_identity_provider_check
      CHECK (primary_identity_provider IN ('supabase', 'auth0'));
  END IF;
END
$$;

COMMENT ON COLUMN public.profiles.auth0_user_id IS
  'Auth0 subject (sub). Unique external Auth0 identity.';

COMMENT ON COLUMN public.profiles.supabase_user_id IS
  'Legacy/optional Supabase Auth user id. Kept during migration.';

COMMENT ON COLUMN public.profiles.id IS
  'Kori internal UUID. All Kori domain foreign keys continue to reference this UUID.';

-- ============================================================================
-- 2. OPTIONAL B2B MIRROR FOR AUTH0 ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_org_id text NOT NULL UNIQUE,
  name text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_memberships (
  organization_id uuid NOT NULL
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'invited', 'disabled')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS organization_memberships_user_idx
  ON public.organization_memberships(user_id);

-- ============================================================================
-- 3. RESOLVE THE CURRENT AUTHENTICATED KORI PROFILE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH token AS (
    SELECT auth.jwt() ->> 'sub' AS sub
  )
  SELECT p.id
  FROM public.profiles p
  CROSS JOIN token t
  WHERE t.sub IS NOT NULL
    AND (
      p.auth0_user_id = t.sub
      OR p.supabase_user_id::text = t.sub
      OR (
        p.auth0_user_id IS NULL
        AND p.supabase_user_id IS NULL
        AND p.id::text = t.sub
      )
    )
  ORDER BY
    CASE
      WHEN p.auth0_user_id = t.sub THEN 0
      WHEN p.supabase_user_id::text = t.sub THEN 1
      ELSE 2
    END
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.current_profile_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated;

-- ============================================================================
-- 4. BOOTSTRAP AUTH0 / SUPABASE IDENTITY INTO KORI
-- ============================================================================

CREATE OR REPLACE FUNCTION public.bootstrap_kori_identity(p_role text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_jwt jsonb := auth.jwt();
  v_sub text;
  v_email text;
  v_email_verified boolean := false;
  v_name text;
  v_org_id text;
  v_org_name text;
  v_org_display_name text;
  v_profile_id uuid;
  v_sub_uuid uuid;
  v_is_supabase_user boolean := false;
  v_org_local_id uuid;
BEGIN
  IF p_role NOT IN ('investor', 'founder') THEN
    RAISE EXCEPTION 'Invalid public onboarding role: %', p_role
      USING ERRCODE = '22023';
  END IF;

  IF COALESCE(v_jwt ->> 'role', '') <> 'authenticated' THEN
    RAISE EXCEPTION 'Authenticated JWT required.'
      USING ERRCODE = '28000';
  END IF;

  v_sub := v_jwt ->> 'sub';

  IF v_sub IS NULL OR length(v_sub) = 0 THEN
    RAISE EXCEPTION 'JWT subject is missing.'
      USING ERRCODE = '28000';
  END IF;

  v_email := NULLIF(v_jwt ->> 'email', '');

  BEGIN
    v_email_verified := COALESCE((v_jwt ->> 'email_verified')::boolean, false);
  EXCEPTION
    WHEN invalid_text_representation THEN
      v_email_verified := false;
  END;

  v_name := COALESCE(
    NULLIF(v_jwt ->> 'name', ''),
    NULLIF(v_jwt ->> 'nickname', ''),
    v_email
  );

  v_org_id := NULLIF(v_jwt ->> 'org_id', '');
  v_org_name := NULLIF(v_jwt ->> 'https://koriventure.co/org_name', '');
  v_org_display_name := NULLIF(v_jwt ->> 'https://koriventure.co/org_display_name', '');

  BEGIN
    v_sub_uuid := v_sub::uuid;

    SELECT EXISTS (
      SELECT 1
      FROM auth.users u
      WHERE u.id = v_sub_uuid
    )
    INTO v_is_supabase_user;
  EXCEPTION
    WHEN invalid_text_representation THEN
      v_sub_uuid := NULL;
      v_is_supabase_user := false;
  END;

  SELECT p.id
  INTO v_profile_id
  FROM public.profiles p
  WHERE p.auth0_user_id = v_sub
  LIMIT 1;

  IF v_profile_id IS NULL AND v_is_supabase_user THEN
    SELECT p.id
    INTO v_profile_id
    FROM public.profiles p
    WHERE p.supabase_user_id = v_sub_uuid
       OR (
         p.supabase_user_id IS NULL
         AND p.id = v_sub_uuid
       )
    LIMIT 1;
  END IF;

  IF v_profile_id IS NULL THEN
    IF v_is_supabase_user THEN
      v_profile_id := v_sub_uuid;

      INSERT INTO public.profiles (
        id,
        supabase_user_id,
        primary_identity_provider,
        email,
        email_verified,
        display_name,
        roles,
        verification_status,
        auth_last_seen_at,
        created_at,
        updated_at
      )
      VALUES (
        v_profile_id,
        v_sub_uuid,
        'supabase',
        v_email,
        v_email_verified,
        v_name,
        ARRAY[p_role]::text[],
        'deferred',
        now(),
        now(),
        now()
      );
    ELSE
      v_profile_id := gen_random_uuid();

      INSERT INTO public.profiles (
        id,
        auth0_user_id,
        primary_identity_provider,
        email,
        email_verified,
        display_name,
        roles,
        verification_status,
        auth_last_seen_at,
        created_at,
        updated_at
      )
      VALUES (
        v_profile_id,
        v_sub,
        'auth0',
        v_email,
        v_email_verified,
        v_name,
        ARRAY[p_role]::text[],
        'deferred',
        now(),
        now(),
        now()
      );
    END IF;
  ELSE
    UPDATE public.profiles p
    SET
      roles = (
        SELECT array_agg(DISTINCT role_value ORDER BY role_value)
        FROM unnest(
          COALESCE(p.roles, '{}'::text[]) || ARRAY[p_role]::text[]
        ) AS role_values(role_value)
      ),
      email = COALESCE(v_email, p.email),
      email_verified = CASE
        WHEN v_email_verified THEN true
        ELSE p.email_verified
      END,
      display_name = COALESCE(p.display_name, v_name),
      auth_last_seen_at = now(),
      updated_at = now()
    WHERE p.id = v_profile_id;
  END IF;

  IF p_role = 'investor' THEN
    INSERT INTO public.investor_profiles (
      user_id,
      onboarding_status,
      created_at,
      updated_at
    )
    VALUES (
      v_profile_id,
      'in_progress',
      now(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      onboarding_status = CASE
        WHEN public.investor_profiles.onboarding_status = 'completed'
          THEN 'completed'
        ELSE 'in_progress'
      END,
      updated_at = now();
  END IF;

  IF p_role = 'founder' THEN
    INSERT INTO public.founder_profiles (
      user_id,
      onboarding_status,
      created_at,
      updated_at
    )
    VALUES (
      v_profile_id,
      'in_progress',
      now(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      onboarding_status = CASE
        WHEN public.founder_profiles.onboarding_status = 'completed'
          THEN 'completed'
        ELSE 'in_progress'
      END,
      updated_at = now();
  END IF;

  INSERT INTO public.onboarding_progress (
    user_id,
    role,
    current_screen,
    completed_screens,
    last_saved_at
  )
  VALUES (
    v_profile_id,
    p_role,
    1,
    ARRAY[0]::smallint[],
    now()
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  IF v_org_id IS NOT NULL THEN
    INSERT INTO public.organizations (
      auth0_org_id,
      name,
      display_name,
      status,
      created_at,
      updated_at
    )
    VALUES (
      v_org_id,
      COALESCE(v_org_name, v_org_id),
      COALESCE(v_org_display_name, v_org_name, v_org_id),
      'active',
      now(),
      now()
    )
    ON CONFLICT (auth0_org_id) DO UPDATE
    SET
      name = COALESCE(EXCLUDED.name, public.organizations.name),
      display_name = COALESCE(EXCLUDED.display_name, public.organizations.display_name),
      status = 'active',
      updated_at = now()
    RETURNING id INTO v_org_local_id;

    INSERT INTO public.organization_memberships (
      organization_id,
      user_id,
      membership_role,
      status,
      joined_at,
      updated_at
    )
    VALUES (
      v_org_local_id,
      v_profile_id,
      'member',
      'active',
      now(),
      now()
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE
    SET
      status = 'active',
      updated_at = now();
  END IF;

  RETURN v_profile_id;
END
$$;

REVOKE ALL ON FUNCTION public.bootstrap_kori_identity(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_kori_identity(text) TO authenticated;

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kori_identity_profile_select" ON public.profiles;
CREATE POLICY "kori_identity_profile_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_profile_update" ON public.profiles;
CREATE POLICY "kori_identity_profile_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = public.current_profile_id())
WITH CHECK (id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_investor_select" ON public.investor_profiles;
CREATE POLICY "kori_identity_investor_select"
ON public.investor_profiles
FOR SELECT
TO authenticated
USING (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_investor_insert" ON public.investor_profiles;
CREATE POLICY "kori_identity_investor_insert"
ON public.investor_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_investor_update" ON public.investor_profiles;
CREATE POLICY "kori_identity_investor_update"
ON public.investor_profiles
FOR UPDATE
TO authenticated
USING (user_id = public.current_profile_id())
WITH CHECK (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_founder_select" ON public.founder_profiles;
CREATE POLICY "kori_identity_founder_select"
ON public.founder_profiles
FOR SELECT
TO authenticated
USING (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_founder_insert" ON public.founder_profiles;
CREATE POLICY "kori_identity_founder_insert"
ON public.founder_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_founder_update" ON public.founder_profiles;
CREATE POLICY "kori_identity_founder_update"
ON public.founder_profiles
FOR UPDATE
TO authenticated
USING (user_id = public.current_profile_id())
WITH CHECK (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_progress_select" ON public.onboarding_progress;
CREATE POLICY "kori_identity_progress_select"
ON public.onboarding_progress
FOR SELECT
TO authenticated
USING (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_progress_insert" ON public.onboarding_progress;
CREATE POLICY "kori_identity_progress_insert"
ON public.onboarding_progress
FOR INSERT
TO authenticated
WITH CHECK (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_progress_update" ON public.onboarding_progress;
CREATE POLICY "kori_identity_progress_update"
ON public.onboarding_progress
FOR UPDATE
TO authenticated
USING (user_id = public.current_profile_id())
WITH CHECK (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_agreement_select" ON public.agreement_acceptances;
CREATE POLICY "kori_identity_agreement_select"
ON public.agreement_acceptances
FOR SELECT
TO authenticated
USING (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_agreement_insert" ON public.agreement_acceptances;
CREATE POLICY "kori_identity_agreement_insert"
ON public.agreement_acceptances
FOR INSERT
TO authenticated
WITH CHECK (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_agreement_update" ON public.agreement_acceptances;
CREATE POLICY "kori_identity_agreement_update"
ON public.agreement_acceptances
FOR UPDATE
TO authenticated
USING (user_id = public.current_profile_id())
WITH CHECK (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_startup_select" ON public.startups;
CREATE POLICY "kori_identity_startup_select"
ON public.startups
FOR SELECT
TO authenticated
USING (primary_founder_user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_startup_insert" ON public.startups;
CREATE POLICY "kori_identity_startup_insert"
ON public.startups
FOR INSERT
TO authenticated
WITH CHECK (primary_founder_user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_startup_update" ON public.startups;
CREATE POLICY "kori_identity_startup_update"
ON public.startups
FOR UPDATE
TO authenticated
USING (primary_founder_user_id = public.current_profile_id())
WITH CHECK (primary_founder_user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_document_select" ON public.startup_documents;
CREATE POLICY "kori_identity_document_select"
ON public.startup_documents
FOR SELECT
TO authenticated
USING (
  uploaded_by_user_id = public.current_profile_id()
  OR EXISTS (
    SELECT 1
    FROM public.startups s
    WHERE s.id = startup_documents.startup_id
      AND s.primary_founder_user_id = public.current_profile_id()
  )
);

DROP POLICY IF EXISTS "kori_identity_document_insert" ON public.startup_documents;
CREATE POLICY "kori_identity_document_insert"
ON public.startup_documents
FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by_user_id = public.current_profile_id()
  AND EXISTS (
    SELECT 1
    FROM public.startups s
    WHERE s.id = startup_documents.startup_id
      AND s.primary_founder_user_id = public.current_profile_id()
  )
);

DROP POLICY IF EXISTS "kori_identity_document_delete" ON public.startup_documents;
CREATE POLICY "kori_identity_document_delete"
ON public.startup_documents
FOR DELETE
TO authenticated
USING (uploaded_by_user_id = public.current_profile_id());

DROP POLICY IF EXISTS "kori_identity_org_select" ON public.organizations;
CREATE POLICY "kori_identity_org_select"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_memberships m
    WHERE m.organization_id = organizations.id
      AND m.user_id = public.current_profile_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS "kori_identity_org_membership_select" ON public.organization_memberships;
CREATE POLICY "kori_identity_org_membership_select"
ON public.organization_memberships
FOR SELECT
TO authenticated
USING (user_id = public.current_profile_id());

-- ============================================================================
-- 6. FOUNDER STORAGE
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('startup-data-room', 'startup-data-room', false)
ON CONFLICT (id) DO UPDATE
SET public = false;

DROP POLICY IF EXISTS "kori_auth0_data_room_select" ON storage.objects;
CREATE POLICY "kori_auth0_data_room_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = public.current_profile_id()::text
);

DROP POLICY IF EXISTS "kori_auth0_data_room_insert" ON storage.objects;
CREATE POLICY "kori_auth0_data_room_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = public.current_profile_id()::text
);

DROP POLICY IF EXISTS "kori_auth0_data_room_update" ON storage.objects;
CREATE POLICY "kori_auth0_data_room_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = public.current_profile_id()::text
)
WITH CHECK (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = public.current_profile_id()::text
);

DROP POLICY IF EXISTS "kori_auth0_data_room_delete" ON storage.objects;
CREATE POLICY "kori_auth0_data_room_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'startup-data-room'
  AND (storage.foldername(name))[1] = public.current_profile_id()::text
);

-- ============================================================================
-- 7. GRANTS
-- ============================================================================

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.investor_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.founder_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.onboarding_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.agreement_acceptances TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.startups TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.startup_documents TO authenticated;
GRANT SELECT ON public.organizations TO authenticated;
GRANT SELECT ON public.organization_memberships TO authenticated;

COMMENT ON FUNCTION public.bootstrap_kori_identity(text) IS
  'Maps an authenticated JWT subject to a Kori UUID and initializes investor/founder onboarding. Public admin bootstrap is rejected.';

COMMENT ON FUNCTION public.current_profile_id() IS
  'Returns the Kori internal UUID for the current Auth0 or legacy Supabase Auth JWT.';

-- ============================================================================
-- 8. POST-CHECKS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'auth0_user_id'
  ) THEN
    RAISE EXCEPTION 'Migration validation failed: profiles.auth0_user_id missing.';
  END IF;

  IF to_regprocedure('public.current_profile_id()') IS NULL THEN
    RAISE EXCEPTION 'Migration validation failed: current_profile_id() missing.';
  END IF;

  IF to_regprocedure('public.bootstrap_kori_identity(text)') IS NULL THEN
    RAISE EXCEPTION 'Migration validation failed: bootstrap_kori_identity(text) missing.';
  END IF;
END
$$;

COMMIT;

-- ============================================================================
-- MANUAL VERIFICATION QUERIES (run separately after the migration)
-- ============================================================================
--
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'profiles'
--   AND column_name IN (
--     'auth0_user_id',
--     'supabase_user_id',
--     'primary_identity_provider',
--     'email',
--     'email_verified',
--     'auth_last_seen_at'
--   )
-- ORDER BY ordinal_position;
--
-- SELECT c.conname
-- FROM pg_constraint c
-- WHERE c.contype = 'f'
--   AND c.conrelid = 'public.profiles'::regclass
--   AND c.confrelid = 'auth.users'::regclass;
-- Expected: 0 rows.
