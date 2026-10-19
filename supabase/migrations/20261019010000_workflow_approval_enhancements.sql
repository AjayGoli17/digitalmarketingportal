-- ====================================================================
-- AURA EDITORIAL AGENCY - WORKFLOW APPROVAL & REVISION HISTORY SCHEMA
-- ====================================================================

-- 1. UPDATE STATUS CHECK CONSTRAINT ON CONTENT_ITEMS
-- Supports: draft, pending, changes, approved, published
ALTER TABLE public.content_items 
    DROP CONSTRAINT IF EXISTS content_items_status_check;

ALTER TABLE public.content_items 
    ADD CONSTRAINT content_items_status_check 
    CHECK (status IN ('draft', 'pending', 'changes', 'approved', 'published', 'scheduled'));

-- 2. ADD WORKFLOW TIMESTAMPS & REVISION TRACKING COLUMNS
ALTER TABLE public.content_items
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS revision_count INT NOT NULL DEFAULT 1;

-- 3. REVISION HISTORY & AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS public.content_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
    revision_number INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'changes', 'approved', 'published')),
    title TEXT NOT NULL,
    caption TEXT,
    feedback_note TEXT,
    target_area TEXT CHECK (target_area IN ('Caption & Copy', 'Slide Photo', 'Scheduling Time', 'Hashtags', 'General')),
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_content_revisions_item ON public.content_revisions(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON public.content_items(status);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR REVISIONS
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

-- Agency members can view and manage all revisions in their workspace
CREATE POLICY "Agency members can view all revisions in workspace"
    ON public.content_revisions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.content_items ci
            JOIN public.clients c ON c.id = ci.client_id
            WHERE ci.id = content_revisions.content_item_id
              AND public.is_workspace_member(c.workspace_id)
        )
    );

CREATE POLICY "Agency members can insert revisions in workspace"
    ON public.content_revisions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_items ci
            JOIN public.clients c ON c.id = ci.client_id
            WHERE ci.id = content_revisions.content_item_id
              AND public.is_workspace_member(c.workspace_id)
        )
    );

-- Client portal users can view revision history for their brand only
CREATE POLICY "Client users can view revisions for their brand"
    ON public.content_revisions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.content_items ci
            WHERE ci.id = content_revisions.content_item_id
              AND public.is_client_member(ci.client_id)
        )
    );

-- Client portal users can insert change request feedback records for their brand
CREATE POLICY "Client users can insert change request revisions for their brand"
    ON public.content_revisions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_items ci
            WHERE ci.id = content_revisions.content_item_id
              AND public.is_client_member(ci.client_id)
        )
    );
