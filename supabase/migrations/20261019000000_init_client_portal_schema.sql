-- ====================================================================
-- AURA EDITORIAL AGENCY - CLIENT PORTAL SCHEMA & ROW LEVEL SECURITY
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. WORKSPACES (Agency Studio Workspaces)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. WORKSPACE MEMBERSHIPS (Agency Staff / Owners)
CREATE TABLE IF NOT EXISTS public.workspace_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (workspace_id, user_id)
);

-- 4. CLIENTS (Retainer Clients e.g. Kanso Botanicals, Maison Studio)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    industry TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'review', 'paused')) DEFAULT 'active',
    retainer_quota INT NOT NULL DEFAULT 12,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (workspace_id, slug)
);

-- 5. CLIENT MEMBERSHIPS (Client Portal Users with scoped brand access)
CREATE TABLE IF NOT EXISTS public.client_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('client_owner', 'reviewer', 'viewer')) DEFAULT 'reviewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (client_id, user_id)
);

-- 6. CONTENT ITEMS / DELIVERABLES (Social Posts, Reels, Carousels, Stories)
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('post', 'carousel', 'reel', 'story')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'changes', 'approved', 'scheduled', 'in_production')) DEFAULT 'pending',
    caption TEXT,
    scheduled_at TIMESTAMPTZ,
    channels TEXT[] NOT NULL DEFAULT '{instagram}'::TEXT[],
    aspect_ratio TEXT NOT NULL DEFAULT '4:5',
    media_urls TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. FEEDBACK PINS & REVISION NOTES (On-asset coordinates and feedback notes)
CREATE TABLE IF NOT EXISTS public.feedback_pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
    slide_index INT NOT NULL DEFAULT 0,
    pin_number INT NOT NULL DEFAULT 1,
    pin_x DOUBLE PRECISION,
    pin_y DOUBLE PRECISION,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    target_area TEXT CHECK (target_area IN ('caption', 'slide_photo', 'timing', 'hashtags', 'general')) DEFAULT 'general',
    note TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_user ON public.workspace_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_workspace ON public.clients(workspace_id);
CREATE INDEX IF NOT EXISTS idx_client_memberships_user ON public.client_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_client ON public.content_items(client_id);
CREATE INDEX IF NOT EXISTS idx_feedback_pins_item ON public.feedback_pins(content_item_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_pins ENABLE ROW LEVEL SECURITY;

-- Security helper functions
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.workspace_memberships
        WHERE workspace_id = _workspace_id
          AND user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.is_client_member(_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.client_memberships
        WHERE client_id = _client_id
          AND user_id = auth.uid()
    );
$$;

-- RLS: WORKSPACES
CREATE POLICY "Agency members can view their workspaces"
    ON public.workspaces FOR SELECT
    USING (public.is_workspace_member(id));

-- RLS: WORKSPACE MEMBERSHIPS
CREATE POLICY "Agency members can view memberships of their workspaces"
    ON public.workspace_memberships FOR SELECT
    USING (public.is_workspace_member(workspace_id));

-- RLS: CLIENTS
-- Agency members can view, insert, update clients in their workspace
CREATE POLICY "Agency members can view clients in their workspace"
    ON public.clients FOR SELECT
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Agency members can insert clients in their workspace"
    ON public.clients FOR INSERT
    WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Agency members can update clients in their workspace"
    ON public.clients FOR UPDATE
    USING (public.is_workspace_member(workspace_id))
    WITH CHECK (public.is_workspace_member(workspace_id));

-- Scoped client access: Client portal users can view ONLY their client
CREATE POLICY "Client users can view only their assigned client record"
    ON public.clients FOR SELECT
    USING (public.is_client_member(id));

-- RLS: CLIENT MEMBERSHIPS
CREATE POLICY "Agency members can manage client memberships"
    ON public.client_memberships FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = client_memberships.client_id
              AND public.is_workspace_member(clients.workspace_id)
        )
    );

CREATE POLICY "Client users can view their own membership"
    ON public.client_memberships FOR SELECT
    USING (user_id = auth.uid());

-- RLS: CONTENT ITEMS
-- Agency staff can manage all content items for clients in their workspace
CREATE POLICY "Agency members can manage content items"
    ON public.content_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = content_items.client_id
              AND public.is_workspace_member(clients.workspace_id)
        )
    );

-- Client portal users can view content for their specific brand only
CREATE POLICY "Client users can view only their brand's content items"
    ON public.content_items FOR SELECT
    USING (public.is_client_member(client_id));

-- Client portal users can update status (sign-off or request changes) for their brand
CREATE POLICY "Client users can sign off or request changes on their brand content"
    ON public.content_items FOR UPDATE
    USING (public.is_client_member(client_id))
    WITH CHECK (public.is_client_member(client_id));

-- RLS: FEEDBACK PINS
-- Agency staff can view and manage pins for their workspace clients
CREATE POLICY "Agency members can manage feedback pins"
    ON public.feedback_pins FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.content_items ci
            JOIN public.clients c ON c.id = ci.client_id
            WHERE ci.id = feedback_pins.content_item_id
              AND public.is_workspace_member(c.workspace_id)
        )
    );

-- Client portal users can view feedback pins for their brand's content items
CREATE POLICY "Client users can view feedback pins for their brand"
    ON public.feedback_pins FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.content_items ci
            WHERE ci.id = feedback_pins.content_item_id
              AND public.is_client_member(ci.client_id)
        )
    );

-- Client portal users can insert feedback pins for their brand's content items
CREATE POLICY "Client users can add feedback pins to their brand items"
    ON public.feedback_pins FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_items ci
            WHERE ci.id = feedback_pins.content_item_id
              AND public.is_client_member(ci.client_id)
        )
    );
