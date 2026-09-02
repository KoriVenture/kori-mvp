-- ============================================================================
-- Kori Investor onboarding runtime schema
-- Migration: 006_onboarding_runtime_schema.sql
--
-- Purpose
-- -------
-- Align the Supabase PostgreSQL schema with the runtime fields used by the
-- current feature/nbrand Investor onboarding.
--
-- Prerequisite
-- ------------
-- 005_supabase_auth_restore.sql must already be applied.
--
-- Safety
-- ------
-- - No table is dropped.
-- - No existing user/profile row is deleted.
-- - Existing columns are preserved.
-- - Missing columns are added idempotently.
-- - Native Supabase Auth remains the identity source.
-- - RLS remains enabled.
-- ============================================================================

BEGIN;

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

  IF to_regclass('public.onboarding_progress') IS NULL THEN
    RAISE EXCEPTION 'Required table public.onboarding_progress does not exist.';
  END IF;

  IF to_regclass('public.agreement_acceptances') IS NULL THEN
    RAISE EXCEPTION 'Required table public.agreement_acceptances does not exist.';
  END IF;
END
$$;

-- Every existing Kori profile must still map to the SAME Supabase Auth UUID.
DO $$
DECLARE
  bad_count integer;
BEGIN
  SELECT count(*)
  INTO bad_count
  FROM public.profiles p
  LEFT JOIN auth.users u
    ON u.id = p.id
  WHERE u.id IS NULL;

  IF bad_count > 0 THEN
    RAISE EXCEPTION
      'Migration stopped: % public.profiles rows do not map to auth.users by the same UUID.',
      bad_count;
  END IF;
END
$$;

-- ============================================================================
-- 1. PUBLIC.PROFILES
-- Fields used by:
--   src/app/api/onboarding/investor/route.ts
--   src/components/onboarding/investor/InvestorOnboarding.tsx
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS legal_first_name text,
  ADD COLUMN IF NOT EXISTS legal_last_name text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS professional_title text,
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS biography text,
  ADD COLUMN IF NOT EXISTS photo_path text,
  ADD COLUMN IF NOT EXISTS languages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_opt_in_at timestamptz;

UPDATE public.profiles p
SET
  email = COALESCE(p.email, u.email),
  email_verified = (u.email_confirmed_at IS NOT NULL),
  updated_at = now()
FROM auth.users u
WHERE u.id = p.id
  AND (
    p.email IS NULL
    OR p.email_verified IS DISTINCT FROM (u.email_confirmed_at IS NOT NULL)
  );

-- ============================================================================
-- 2. PUBLIC.INVESTOR_PROFILES
-- ============================================================================

ALTER TABLE public.investor_profiles
  ADD COLUMN IF NOT EXISTS investor_type text NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS contribution_areas text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ask_me_about text,
  ADD COLUMN IF NOT EXISTS preferred_regions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS investment_stages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_ticket_sizes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_ticket_size text,
  ADD COLUMN IF NOT EXISTS preferred_instruments text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS investment_horizon text,
  ADD COLUMN IF NOT EXISTS investment_thesis text,
  ADD COLUMN IF NOT EXISTS investor_classification text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS private_company_experience text,
  ADD COLUMN IF NOT EXISTS source_of_funds text,
  ADD COLUMN IF NOT EXISTS risk_acknowledged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_status text NOT NULL DEFAULT 'in_progress',
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.investor_profiles'::regclass
      AND conname = 'investor_profiles_investor_type_check'
  ) THEN
    ALTER TABLE public.investor_profiles
      ADD CONSTRAINT investor_profiles_investor_type_check
      CHECK (investor_type IN ('individual', 'fund_manager'));
  END IF;
END
$$;

-- ============================================================================
-- 3. ONBOARDING PROGRESS
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS onboarding_progress_user_role_uidx
  ON public.onboarding_progress (user_id, role);

-- ============================================================================
-- 4. AGREEMENT ACCEPTANCES
-- ============================================================================

ALTER TABLE public.agreement_acceptances
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS agreement_type text,
  ADD COLUMN IF NOT EXISTS agreement_version text,
  ADD COLUMN IF NOT EXISTS accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signature_name text,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS agreement_acceptances_identity_uidx
  ON public.agreement_acceptances (
    user_id,
    role,
    agreement_type,
    agreement_version
  );

-- ============================================================================
-- 5. FOREIGN KEY: PROFILES.ID -> AUTH.USERS.ID
-- ============================================================================

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

-- ============================================================================
-- 6. RLS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_own
  ON public.profiles;

CREATE POLICY profiles_own
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS investor_profiles_own
  ON public.investor_profiles;

CREATE POLICY investor_profiles_own
ON public.investor_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS onboarding_progress_own
  ON public.onboarding_progress;

CREATE POLICY onboarding_progress_own
ON public.onboarding_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS agreement_acceptances_own
  ON public.agreement_acceptances;

CREATE POLICY agreement_acceptances_own
ON public.agreement_acceptances
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 7. OBSOLETE AUTH0 BRIDGE MUST REMAIN ABSENT
-- ============================================================================

DROP FUNCTION IF EXISTS public.current_profile_id();
DROP FUNCTION IF EXISTS public.bootstrap_kori_identity(text);

-- ============================================================================
-- 8. POSTGREST SCHEMA CACHE
-- ============================================================================

NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================================
-- REQUIRED POST-CHECKS
-- ============================================================================

SELECT
  p.id,
  p.email
FROM public.profiles p
LEFT JOIN auth.users u
  ON u.id = p.id
WHERE u.id IS NULL;

WITH required_columns(column_name) AS (
  VALUES
    ('id'),
    ('email'),
    ('email_verified'),
    ('country'),
    ('legal_first_name'),
    ('legal_last_name'),
    ('city'),
    ('timezone'),
    ('linkedin_url'),
    ('professional_title'),
    ('organization'),
    ('biography'),
    ('photo_path'),
    ('languages'),
    ('marketing_opt_in'),
    ('marketing_opt_in_at')
)
SELECT r.column_name AS missing_profile_column
FROM required_columns r
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name = 'profiles'
 AND c.column_name = r.column_name
WHERE c.column_name IS NULL
ORDER BY r.column_name;

WITH required_columns(column_name) AS (
  VALUES
    ('user_id'),
    ('investor_type'),
    ('contribution_areas'),
    ('ask_me_about'),
    ('preferred_regions'),
    ('investment_stages'),
    ('preferred_ticket_sizes'),
    ('preferred_ticket_size'),
    ('preferred_instruments'),
    ('investment_horizon'),
    ('investment_thesis'),
    ('investor_classification'),
    ('experience'),
    ('private_company_experience'),
    ('source_of_funds'),
    ('risk_acknowledged'),
    ('onboarding_status'),
    ('completed_at')
)
SELECT r.column_name AS missing_investor_column
FROM required_columns r
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name = 'investor_profiles'
 AND c.column_name = r.column_name
WHERE c.column_name IS NULL
ORDER BY r.column_name;

SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'investor_profiles',
    'onboarding_progress',
    'agreement_acceptances'
  )
ORDER BY tablename, policyname;

SELECT proname
FROM pg_proc
WHERE proname IN (
  'current_profile_id',
  'bootstrap_kori_identity'
);

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname = 'onboarding_progress_user_role_uidx'
    OR indexname = 'agreement_acceptances_identity_uidx'
  )
ORDER BY indexname;
