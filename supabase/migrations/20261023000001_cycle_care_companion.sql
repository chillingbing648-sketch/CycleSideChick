-- ==============================================================================
-- CycleSideChick — Cycle Care Companion Database Migration
-- Version: 20261023000001
-- Description: Schema, Row-Level Security, and Atomic Functions for Cycle Care Companion
-- ==============================================================================

-- 1. Sharing Profiles (Public display metadata for authenticated sharing users)
CREATE TABLE IF NOT EXISTS public.sharing_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) <= 50),
  avatar_icon TEXT DEFAULT 'heart',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Sharing Invitations (Cryptographically hashed single-use invitations)
CREATE TABLE IF NOT EXISTS public.sharing_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '{
    "sharePhase": true,
    "shareDay": true,
    "sharePeriodStatus": true,
    "shareEstimatedDates": true,
    "shareFeelings": true,
    "shareSymptoms": true,
    "shareEnergy": true,
    "shareMood": true,
    "shareNotes": false,
    "shareSupportPreferences": true
  }'::jsonb,
  humorous_notifications BOOLEAN NOT NULL DEFAULT true,
  allowed_responses TEXT[] NOT NULL DEFAULT ARRAY[
    'here_for_you',
    'would_you_like_help',
    'take_care_of_task',
    'prefer_some_space',
    'extra_love',
    'check_in_later'
  ]::text[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now() + INTERVAL '48 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  claimed_at TIMESTAMPTZ,
  claimed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_sharing_invitations_token_hash ON public.sharing_invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_sharing_invitations_owner ON public.sharing_invitations(owner_id);

-- 3. Sharing Relationships (1-to-1 active or paused/revoked connection)
CREATE TABLE IF NOT EXISTS public.sharing_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES public.sharing_invitations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'revoked')),
  permissions JSONB NOT NULL DEFAULT '{
    "sharePhase": true,
    "shareDay": true,
    "sharePeriodStatus": true,
    "shareEstimatedDates": true,
    "shareFeelings": true,
    "shareSymptoms": true,
    "shareEnergy": true,
    "shareMood": true,
    "shareNotes": false,
    "shareSupportPreferences": true
  }'::jsonb,
  humorous_notifications BOOLEAN NOT NULL DEFAULT true,
  allowed_responses TEXT[] NOT NULL DEFAULT ARRAY[
    'here_for_you',
    'would_you_like_help',
    'take_care_of_task',
    'prefer_some_space',
    'extra_love',
    'check_in_later'
  ]::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  revoked_at TIMESTAMPTZ,
  CONSTRAINT unique_owner_recipient UNIQUE (owner_id, recipient_id),
  CONSTRAINT check_owner_not_recipient CHECK (owner_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_sharing_relationships_owner ON public.sharing_relationships(owner_id);
CREATE INDEX IF NOT EXISTS idx_sharing_relationships_recipient ON public.sharing_relationships(recipient_id);

-- 4. Shared Cycle Snapshots (Only owner-approved status records)
CREATE TABLE IF NOT EXISTS public.shared_cycle_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES public.sharing_relationships(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_phase TEXT,
  cycle_day INTEGER CHECK (cycle_day IS NULL OR cycle_day >= 1),
  period_status TEXT,
  is_period_logged BOOLEAN DEFAULT false,
  next_period_est TEXT,
  fertile_window_est TEXT,
  feelings JSONB,
  symptoms JSONB,
  energy_level TEXT,
  mood TEXT,
  owner_notes TEXT,
  support_preference TEXT,
  support_suggestion TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_shared_snapshots_rel ON public.shared_cycle_snapshots(relationship_id);
CREATE INDEX IF NOT EXISTS idx_shared_snapshots_synced ON public.shared_cycle_snapshots(synced_at DESC);

-- 5. Predefined Support Responses (Recipient-to-owner predefined responses only)
CREATE TABLE IF NOT EXISTS public.predefined_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES public.sharing_relationships(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_key TEXT NOT NULL CHECK (response_key IN (
    'here_for_you',
    'would_you_like_help',
    'take_care_of_task',
    'prefer_some_space',
    'extra_love',
    'check_in_later'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_predefined_responses_rel ON public.predefined_responses(relationship_id);
CREATE INDEX IF NOT EXISTS idx_predefined_responses_owner ON public.predefined_responses(owner_id);

-- 6. Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  quiet_hours_start INTEGER NOT NULL DEFAULT 22 CHECK (quiet_hours_start BETWEEN 0 AND 23),
  quiet_hours_end INTEGER NOT NULL DEFAULT 8 CHECK (quiet_hours_end BETWEEN 0 AND 23),
  frequency_cap_hours INTEGER NOT NULL DEFAULT 4 CHECK (frequency_cap_hours >= 1),
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. Web Push Subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.push_subscriptions(user_id);

-- 8. Notification Jobs (Durable background delivery queue)
CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES public.sharing_relationships(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'suppressed', 'expired', 'revoked')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_notif_jobs_status_sched ON public.notification_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notif_jobs_rel ON public.notification_jobs(relationship_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.sharing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sharing_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sharing_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_cycle_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predefined_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Own user can manage; paired partner can view profile
CREATE POLICY "Users can view own profile"
  ON public.sharing_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Paired companions can view profile display name"
  ON public.sharing_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sharing_relationships r
      WHERE (r.owner_id = auth.uid() AND r.recipient_id = public.sharing_profiles.id)
         OR (r.recipient_id = auth.uid() AND r.owner_id = public.sharing_profiles.id)
    )
  );

CREATE POLICY "Users can insert own profile"
  ON public.sharing_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.sharing_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Invitations: Owner can select, insert, update
CREATE POLICY "Owners can view own invitations"
  ON public.sharing_invitations FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert invitations"
  ON public.sharing_invitations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own invitations"
  ON public.sharing_invitations FOR UPDATE
  USING (auth.uid() = owner_id);

-- 3. Relationships: Both owner and recipient can view active or paused relationship
CREATE POLICY "Participants can view their relationships"
  ON public.sharing_relationships FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = recipient_id);

CREATE POLICY "Owners can update relationship settings"
  ON public.sharing_relationships FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = recipient_id);

-- 4. Shared Cycle Snapshots:
-- Owner can insert and view snapshots.
-- Recipient can ONLY view if relationship is 'active'.
CREATE POLICY "Owners can view their snapshots"
  ON public.shared_cycle_snapshots FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Active recipients can view authorized snapshots"
  ON public.shared_cycle_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sharing_relationships r
      WHERE r.id = public.shared_cycle_snapshots.relationship_id
        AND r.recipient_id = auth.uid()
        AND r.status = 'active'
    )
  );

CREATE POLICY "Owners can insert snapshots"
  ON public.shared_cycle_snapshots FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM public.sharing_relationships r
      WHERE r.id = public.shared_cycle_snapshots.relationship_id
        AND r.owner_id = auth.uid()
        AND r.status = 'active'
    )
  );

-- 5. Predefined Responses:
-- Recipient can insert valid response.
-- Owner can view responses received.
CREATE POLICY "Owners can view incoming responses"
  ON public.predefined_responses FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Recipients can view responses they sent"
  ON public.predefined_responses FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Active recipients can insert permitted predefined responses"
  ON public.predefined_responses FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.sharing_relationships r
      WHERE r.id = public.predefined_responses.relationship_id
        AND r.recipient_id = auth.uid()
        AND r.owner_id = public.predefined_responses.owner_id
        AND r.status = 'active'
        AND public.predefined_responses.response_key = ANY(r.allowed_responses)
    )
  );

-- 6. Notification Preferences
CREATE POLICY "Users can manage own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Push Subscriptions
CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Notification Jobs:
-- Owner and recipient can view audit status of jobs for their relationship
CREATE POLICY "Participants can view notification audit status"
  ON public.notification_jobs FOR SELECT
  USING (
    auth.uid() = recipient_id OR
    EXISTS (
      SELECT 1 FROM public.sharing_relationships r
      WHERE r.id = public.notification_jobs.relationship_id
        AND r.owner_id = auth.uid()
    )
  );

-- ==============================================================================
-- DATABASE STORED FUNCTIONS (ATOMIC OPERATIONS)
-- ==============================================================================

-- Function 1: Atomically Claim an Invitation
CREATE OR REPLACE FUNCTION public.claim_companion_invitation(
  p_token_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_recipient_id UUID;
  v_existing_rel RECORD;
  v_relationship_id UUID;
BEGIN
  v_recipient_id := auth.uid();
  IF v_recipient_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to accept an invitation.' USING ERRCODE = '42501';
  END IF;

  -- 1. Lock and retrieve invitation
  SELECT * INTO v_invitation
  FROM public.sharing_invitations
  WHERE token_hash = p_token_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or invalid.' USING ERRCODE = 'P0002';
  END IF;

  IF v_invitation.status = 'claimed' THEN
    RAISE EXCEPTION 'This invitation has already been claimed.' USING ERRCODE = '23505';
  END IF;

  IF v_invitation.status = 'revoked' THEN
    RAISE EXCEPTION 'This invitation has been revoked by the owner.' USING ERRCODE = '42000';
  END IF;

  IF v_invitation.expires_at < timezone('utc', now()) THEN
    UPDATE public.sharing_invitations
    SET status = 'expired'
    WHERE id = v_invitation.id;
    RAISE EXCEPTION 'This invitation has expired.' USING ERRCODE = '22007';
  END IF;

  IF v_invitation.owner_id = v_recipient_id THEN
    RAISE EXCEPTION 'You cannot accept your own invitation.' USING ERRCODE = '22023';
  END IF;

  -- 2. Mark invitation as claimed atomically
  UPDATE public.sharing_invitations
  SET status = 'claimed',
      claimed_at = timezone('utc', now()),
      claimed_by = v_recipient_id
  WHERE id = v_invitation.id;

  -- 3. Insert or reactivate relationship
  INSERT INTO public.sharing_relationships (
    owner_id,
    recipient_id,
    invitation_id,
    status,
    permissions,
    humorous_notifications,
    allowed_responses,
    created_at,
    updated_at
  )
  VALUES (
    v_invitation.owner_id,
    v_recipient_id,
    v_invitation.id,
    'active',
    v_invitation.permissions,
    v_invitation.humorous_notifications,
    v_invitation.allowed_responses,
    timezone('utc', now()),
    timezone('utc', now())
  )
  ON CONFLICT (owner_id, recipient_id)
  DO UPDATE SET
    status = 'active',
    invitation_id = v_invitation.id,
    permissions = v_invitation.permissions,
    humorous_notifications = v_invitation.humorous_notifications,
    allowed_responses = v_invitation.allowed_responses,
    updated_at = timezone('utc', now()),
    revoked_at = NULL
  RETURNING id INTO v_relationship_id;

  RETURN jsonb_build_object(
    'success', true,
    'relationship_id', v_relationship_id,
    'owner_id', v_invitation.owner_id,
    'permissions', v_invitation.permissions,
    'humorous_notifications', v_invitation.humorous_notifications,
    'allowed_responses', v_invitation.allowed_responses
  );
END;
$$;

-- Function 2: Revoke Relationship
CREATE OR REPLACE FUNCTION public.revoke_companion_relationship(
  p_relationship_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rel RECORD;
  v_caller UUID;
BEGIN
  v_caller := auth.uid();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_rel
  FROM public.sharing_relationships
  WHERE id = p_relationship_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Relationship not found.' USING ERRCODE = 'P0002';
  END IF;

  IF v_rel.owner_id <> v_caller AND v_rel.recipient_id <> v_caller THEN
    RAISE EXCEPTION 'Access denied.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.sharing_relationships
  SET status = 'revoked',
      revoked_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  WHERE id = p_relationship_id;

  -- Invalidate pending notifications immediately
  UPDATE public.notification_jobs
  SET status = 'revoked'
  WHERE relationship_id = p_relationship_id
    AND status = 'pending';

  RETURN jsonb_build_object(
    'success', true,
    'relationship_id', p_relationship_id,
    'status', 'revoked'
  );
END;
$$;
