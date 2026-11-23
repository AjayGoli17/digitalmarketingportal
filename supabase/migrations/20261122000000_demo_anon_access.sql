-- ====================================================================
-- AURA EDITORIAL AGENCY - DEMO ANONYMOUS ACCESS
-- This client portal MVP has no login yet (auth comes later). The
-- existing RLS policies all require auth.uid() membership, which blocks
-- every request made with the anon key. These demo-only policies let
-- the anon role read/write the workspace data so the app can run
-- without authentication. Revisit/remove once login is introduced.
-- ====================================================================

CREATE POLICY "Demo anon can view workspaces"
    ON public.workspaces FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Demo anon can view clients"
    ON public.clients FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Demo anon can update clients"
    ON public.clients FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Demo anon can manage content items"
    ON public.content_items FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Demo anon can manage content revisions"
    ON public.content_revisions FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Demo anon can manage feedback pins"
    ON public.feedback_pins FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
