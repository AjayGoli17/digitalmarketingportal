-- ==============================================================================
-- AURA EDITORIAL AGENCY — CLIENT DELIVERABLE QUOTAS & PACING ENHANCEMENT
-- Migration: 20261019020000_client_quota_breakdown.sql
-- ==============================================================================

-- 1. ADD FORMAT-SPECIFIC PACKAGE QUOTAS TO CLIENTS TABLE
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS quota_posts INT NOT NULL DEFAULT 4,
ADD COLUMN IF NOT EXISTS quota_reels INT NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS quota_carousels INT NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS quota_stories INT NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS quota_total INT NOT NULL DEFAULT 10;

-- 2. ADD COMMENTARY FOR SCHEMA DOCUMENTATION
COMMENT ON COLUMN public.clients.quota_posts IS 'Monthly contracted feed posts package quota';
COMMENT ON COLUMN public.clients.quota_reels IS 'Monthly contracted short-form video & reels package quota';
COMMENT ON COLUMN public.clients.quota_carousels IS 'Monthly contracted multi-slide carousel package quota';
COMMENT ON COLUMN public.clients.quota_stories IS 'Monthly contracted ephemeral stories package quota';
COMMENT ON COLUMN public.clients.quota_total IS 'Monthly aggregate contractual deliverable quota across formats';

-- 3. ENSURE DELIVERABLES STATUS CONSTRAINT SUPPORTS 'published'
DO $$
BEGIN
    -- Check if status constraint exists and includes 'published'
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'content_items_status_check'
    ) THEN
        ALTER TABLE public.content_items DROP CONSTRAINT content_items_status_check;
        ALTER TABLE public.content_items ADD CONSTRAINT content_items_status_check
            CHECK (status IN ('draft', 'pending', 'changes', 'approved', 'published', 'scheduled', 'in_production'));
    END IF;
END $$;
