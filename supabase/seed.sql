-- ====================================================================
-- AURA EDITORIAL AGENCY - DEMO SEED DATA
-- One demo workspace, the sample clients (with their package quotas),
-- and content items/revisions converted from the app's former sample
-- data (src/lib/data/contentItems.ts and src/lib/data/clients.ts).
-- All dates are relative to now() so the workspace always looks current.
-- ====================================================================

DO $$
DECLARE
  v_workspace_id UUID;
  v_kanso_id UUID;
  v_alta_id UUID;
  v_maison_id UUID;
  v_ceramics_id UUID;
  v_item_id UUID;
  v_ts TIMESTAMPTZ;
BEGIN
  -- 1. WORKSPACE ------------------------------------------------------
  INSERT INTO public.workspaces (name, slug)
  VALUES ('Aura Editorial Agency', 'aura-editorial-agency')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_workspace_id;

  -- 2. CLIENTS + PACKAGE QUOTAS ----------------------------------------
  INSERT INTO public.clients (workspace_id, name, slug, industry, status, retainer_quota, quota_posts, quota_reels, quota_carousels, quota_stories, quota_total)
  VALUES (v_workspace_id, 'Kanso Botanicals', 'kanso-botanicals', 'Skincare & Wellness', 'active', 12, 6, 2, 2, 2, 12)
  ON CONFLICT (workspace_id, slug) DO UPDATE SET
    industry = EXCLUDED.industry, status = EXCLUDED.status, retainer_quota = EXCLUDED.retainer_quota,
    quota_posts = EXCLUDED.quota_posts, quota_reels = EXCLUDED.quota_reels, quota_carousels = EXCLUDED.quota_carousels,
    quota_stories = EXCLUDED.quota_stories, quota_total = EXCLUDED.quota_total
  RETURNING id INTO v_kanso_id;

  INSERT INTO public.clients (workspace_id, name, slug, industry, status, retainer_quota, quota_posts, quota_reels, quota_carousels, quota_stories, quota_total)
  VALUES (v_workspace_id, 'Alta Living', 'alta-living', 'Hospitality & Interiors', 'active', 18, 8, 4, 4, 2, 18)
  ON CONFLICT (workspace_id, slug) DO UPDATE SET
    industry = EXCLUDED.industry, status = EXCLUDED.status, retainer_quota = EXCLUDED.retainer_quota,
    quota_posts = EXCLUDED.quota_posts, quota_reels = EXCLUDED.quota_reels, quota_carousels = EXCLUDED.quota_carousels,
    quota_stories = EXCLUDED.quota_stories, quota_total = EXCLUDED.quota_total
  RETURNING id INTO v_alta_id;

  INSERT INTO public.clients (workspace_id, name, slug, industry, status, retainer_quota, quota_posts, quota_reels, quota_carousels, quota_stories, quota_total)
  VALUES (v_workspace_id, 'Maison Studio', 'maison-studio', 'Luxury Fashion', 'review', 8, 4, 2, 1, 1, 8)
  ON CONFLICT (workspace_id, slug) DO UPDATE SET
    industry = EXCLUDED.industry, status = EXCLUDED.status, retainer_quota = EXCLUDED.retainer_quota,
    quota_posts = EXCLUDED.quota_posts, quota_reels = EXCLUDED.quota_reels, quota_carousels = EXCLUDED.quota_carousels,
    quota_stories = EXCLUDED.quota_stories, quota_total = EXCLUDED.quota_total
  RETURNING id INTO v_maison_id;

  INSERT INTO public.clients (workspace_id, name, slug, industry, status, retainer_quota, quota_posts, quota_reels, quota_carousels, quota_stories, quota_total)
  VALUES (v_workspace_id, 'Ceramics & Form', 'ceramics-and-form', 'Artisan Interior', 'active', 10, 4, 2, 2, 2, 10)
  ON CONFLICT (workspace_id, slug) DO UPDATE SET
    industry = EXCLUDED.industry, status = EXCLUDED.status, retainer_quota = EXCLUDED.retainer_quota,
    quota_posts = EXCLUDED.quota_posts, quota_reels = EXCLUDED.quota_reels, quota_carousels = EXCLUDED.quota_carousels,
    quota_stories = EXCLUDED.quota_stories, quota_total = EXCLUDED.quota_total
  RETURNING id INTO v_ceramics_id;

  -- 3. CONTENT ITEMS, REVISIONS & FEEDBACK -----------------------------
  -- Clear any previously seeded demo content so this script can be re-run.
  DELETE FROM public.content_items WHERE client_id IN (v_kanso_id, v_alta_id, v_maison_id, v_ceramics_id);

  -- Item 1: Approved (Botanica Drops)
  v_ts := now() - interval '11 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'Botanica Drops', 'post', 'approved',
    'Formulations grounded in wild harvesting. Our cold-pressed botanical drops hydrate and restore dermal barrier balance. #BotanicaDrops #Kanso #CleanSkincare',
    v_ts, ARRAY['instagram'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Post', 'statusLabel', 'Approved', 'bgGradient', 'from-[#E6DFD5] to-[#CCC2B4]', 'previewHeroText', 'Aura Botanica',
      'approvalRecord', jsonb_build_object('approvedBy', 'Elena Rostova (Client)', 'approvedAt', to_char(v_ts - interval '1 day', 'Mon FMDD, YYYY, FMHH12:MI AM'), 'comment', 'Approved for scheduled publication.'),
      'slides', jsonb_build_array(jsonb_build_object('id', 1, 'title', 'Botanica Drops', 'subtitle', 'HERO SERUM STILL', 'bgGradient', 'from-[#ECE5DC] to-[#D5CABE]', 'filename', 'Botanica_Drops_V1.png'))
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'approved', 'Botanica Drops', 'Formulations grounded in wild harvesting. Our cold-pressed botanical drops hydrate and restore dermal barrier balance.', 'Elena Rostova (Client)');

  -- Item 2: Pending client approval (Founder Q&A)
  v_ts := now() - interval '9 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'Founder Q&A', 'reel', 'pending',
    'Elena sits down to discuss the autumn extraction process and answers community questions regarding meadowfoam integrity. #BehindTheBrand #FounderStory',
    v_ts, ARRAY['instagram', 'tiktok'], '9:16', 1,
    jsonb_build_object(
      'formatLabel', 'Reel', 'statusLabel', 'Pending Approval', 'bgGradient', 'from-[#DDD5CD] to-[#BFB4A8]', 'previewHeroText', 'Founder Q&A', 'duration', '0:42',
      'slides', jsonb_build_array(jsonb_build_object('id', 1, 'title', 'Elena Q&A Cut', 'subtitle', '0:42 REEL VIDEO', 'bgGradient', 'from-[#DDD5CD] to-[#BFB4A8]', 'filename', 'Founder_Story_4K.mp4'))
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption)
  VALUES (v_item_id, 1, 'pending', 'Founder Q&A', 'Elena sits down to discuss the autumn extraction process and answers community questions regarding meadowfoam integrity.');

  -- Item 3: Changes requested (Studio Sanctuary) + client feedback pin
  v_ts := now() - interval '7 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'Studio Sanctuary', 'carousel', 'changes',
    'A walkthrough of our botanical apothecary and stone drying room. Natural illumination meets restrained design. #StudioSanctuary #CleanAesthetic',
    v_ts, ARRAY['instagram', 'pinterest'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Carousel', 'statusLabel', 'Changes Requested', 'bgGradient', 'from-[#DFD7CF] to-[#C9BFB5]', 'previewHeroText', 'Studio Sanctuary', 'slideCount', 4,
      'slides', jsonb_build_array(
        jsonb_build_object('id', 1, 'title', 'Apothecary Overview', 'bgGradient', 'from-[#E6DFD5] to-[#CCC2B4]'),
        jsonb_build_object('id', 2, 'title', 'Stoneware Vessels', 'bgGradient', 'from-[#DFD7CF] to-[#C9BFB5]'),
        jsonb_build_object('id', 3, 'title', 'Drying Flora', 'bgGradient', 'from-[#D5CDC3] to-[#B8AEA0]'),
        jsonb_build_object('id', 4, 'title', 'Bench Detail', 'bgGradient', 'from-[#CFCBC8] to-[#ABA6A1]')
      )
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, feedback_note, target_area, reviewer_name)
  VALUES (
    v_item_id, 1, 'changes', 'Studio Sanctuary',
    'A walkthrough of our botanical apothecary and stone drying room. Natural illumination meets restrained design.',
    'Could we warm up the lighting on slide 2? The stone vessels look slightly too cool against the brand palette.',
    'Slide Photo', 'Elena Rostova (Client)'
  );
  INSERT INTO public.feedback_pins (content_item_id, slide_index, pin_number, author_name, target_area, note, created_at)
  VALUES (v_item_id, 1, 1, 'Elena Rostova (Client)', 'slide_photo', 'Could we warm up the lighting on slide 2? The stone vessels look slightly too cool against the brand palette.', v_ts - interval '1 day');

  -- Item 4: Draft (Early Access VIP Vault)
  v_ts := now() - interval '3 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'Early Access VIP Vault', 'story', 'draft',
    'Private VIP link for Autumn Drop 02 subscribers. Swipe up to access remaining numbered batches. #EarlyAccess #AuraCurations',
    v_ts, ARRAY['instagram'], '9:16', 1,
    jsonb_build_object('formatLabel', 'Story', 'statusLabel', 'Draft', 'bgGradient', 'from-[#D5CDC3] to-[#B8AEA0]', 'previewHeroText', 'Early Access')
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption)
  VALUES (v_item_id, 1, 'draft', 'Early Access VIP Vault', 'Private VIP link for Autumn Drop 02 subscribers. Swipe up to access remaining numbered batches.');

  -- Item 5: Published (Evening Ritual)
  v_ts := now() - interval '1 day';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, published_at, metadata)
  VALUES (
    v_kanso_id, 'Evening Ritual', 'reel', 'published',
    'Nighttime restoration sequence. Four drops warmed in palms and applied with slow upward strokes. #EveningRitual #SlowBeauty',
    v_ts, ARRAY['instagram', 'tiktok'], '9:16', 1, v_ts,
    jsonb_build_object(
      'formatLabel', 'Reel', 'statusLabel', 'Published', 'bgGradient', 'from-[#DDD5CD] to-[#BFB4A8]', 'previewHeroText', 'Evening Ritual', 'duration', '0:30',
      'approvalRecord', jsonb_build_object('approvedBy', 'Elena Rostova (Client)', 'approvedAt', to_char(v_ts - interval '4 days', 'Mon FMDD, YYYY, FMHH12:MI AM'))
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'published', 'Evening Ritual', 'Nighttime restoration sequence. Four drops warmed in palms and applied with slow upward strokes.', 'Elena Rostova (Client)');

  -- Item 6: Approved (Serum Study)
  v_ts := now();
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'Serum Study', 'post', 'approved',
    'Ingredient provenance: maritime cedar oil distilled at 60 degrees to preserve active antioxidants. #BotanicalStudy #IngredientTruth',
    v_ts, ARRAY['instagram', 'pinterest'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Post', 'statusLabel', 'Approved', 'bgGradient', 'from-[#E6DFD5] to-[#CCC2B4]', 'previewHeroText', 'Serum Study',
      'approvalRecord', jsonb_build_object('approvedBy', 'Elena Rostova (Client)', 'approvedAt', to_char(v_ts - interval '1 day', 'Mon FMDD, YYYY, FMHH12:MI AM'), 'comment', 'Approved for scheduled publication.')
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'approved', 'Serum Study', 'Ingredient provenance: maritime cedar oil distilled at 60 degrees to preserve active antioxidants.', 'Elena Rostova (Client)');

  -- Item 7: Pending client approval (VIP Drop)
  v_ts := now() + interval '5 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'VIP Drop', 'story', 'pending',
    'Exclusive preview for Tier II partners. RSVP for tomorrow''s live keynote studio broadcast.',
    v_ts, ARRAY['instagram'], '9:16', 1,
    jsonb_build_object('formatLabel', 'Story', 'statusLabel', 'Pending', 'bgGradient', 'from-[#CFCBC8] to-[#ABA6A1]', 'previewHeroText', 'VIP Drop')
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption)
  VALUES (v_item_id, 1, 'pending', 'VIP Drop', 'Exclusive preview for Tier II partners. RSVP for tomorrow''s live keynote studio broadcast.');

  -- Item 8: Pending client approval (Restorative Botanical Elixir — Autumn Drop 02)
  v_ts := now() - interval '1 day';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'Restorative Botanical Elixir — Autumn Drop 02', 'carousel', 'pending',
    'Quiet formulations for loud environments. Batch 04 features organic cold-pressed meadowfoam and raw maritime cedar. Link in bio for private vault access. #KansoBotanicals #CleanFormulations #MindfulRituals #BotanicalSkincare',
    v_ts, ARRAY['instagram', 'pinterest'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Carousel', 'statusLabel', 'Pending', 'bgGradient', 'from-[#DFD7CF] to-[#C9BFB5]', 'previewHeroText', 'Aura Botanica', 'slideCount', 5,
      'slides', jsonb_build_array(
        jsonb_build_object('id', 1, 'title', 'Packaging Still', 'bgGradient', 'from-[#ECE5DC] to-[#D5CABE]'),
        jsonb_build_object('id', 2, 'title', 'Texture Focus', 'subtitle', '2400 x 3000px', 'bgGradient', 'from-[#DFD7CF] to-[#C9BFB5]'),
        jsonb_build_object('id', 3, 'title', 'Application Study', 'bgGradient', 'from-[#DDD5CD] to-[#BFB4A8]'),
        jsonb_build_object('id', 4, 'title', 'Founder Portrait', 'bgGradient', 'from-[#D5CDC3] to-[#B8AEA0]'),
        jsonb_build_object('id', 5, 'title', 'Unboxing Gift Box', 'bgGradient', 'from-[#CFCBC8] to-[#ABA6A1]')
      )
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption)
  VALUES (v_item_id, 1, 'pending', 'Restorative Botanical Elixir — Autumn Drop 02', 'Quiet formulations for loud environments. Batch 04 features organic cold-pressed meadowfoam and raw maritime cedar.');

  -- Item 9: Approved (Mineral Hydration Masque)
  v_ts := now() + interval '7 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'Mineral Hydration Masque', 'post', 'approved',
    'Deep marine clay infused with alpine chamomile. Weekly reset for stressed barrier layers.',
    v_ts, ARRAY['instagram'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Post', 'statusLabel', 'Approved', 'bgGradient', 'from-[#E6DFD5] to-[#CCC2B4]', 'previewHeroText', 'Mineral Masque',
      'approvalRecord', jsonb_build_object('approvedBy', 'Elena Rostova (Client)', 'approvedAt', to_char(now() - interval '1 day', 'Mon FMDD, YYYY, FMHH12:MI AM'), 'comment', 'Approved for scheduled publication.')
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'approved', 'Mineral Hydration Masque', 'Deep marine clay infused with alpine chamomile. Weekly reset for stressed barrier layers.', 'Elena Rostova (Client)');

  -- Item 10: Approved (Solstice Ritual Teaser)
  v_ts := now() + interval '10 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'Solstice Ritual Teaser', 'post', 'approved',
    'Marking the arrival of winter light. First batch teasers dropping exclusively to email list.',
    v_ts, ARRAY['instagram', 'pinterest'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Post', 'statusLabel', 'Approved', 'bgGradient', 'from-[#DFD7CF] to-[#C9BFB5]', 'previewHeroText', 'Solstice Ritual',
      'approvalRecord', jsonb_build_object('approvedBy', 'Elena Rostova (Client)', 'approvedAt', to_char(now() - interval '1 day', 'Mon FMDD, YYYY, FMHH12:MI AM'), 'comment', 'Approved for scheduled publication.')
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'approved', 'Solstice Ritual Teaser', 'Marking the arrival of winter light. First batch teasers dropping exclusively to email list.', 'Elena Rostova (Client)');

  -- Item 11: Approved (Extraction Lab Micro-Cuts)
  v_ts := now() + interval '12 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'Extraction Lab Micro-Cuts', 'post', 'approved',
    'Macro views of botanical oil distillation. Preserving cold-pressed bioactive nutrients.',
    v_ts, ARRAY['instagram'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Post', 'statusLabel', 'Approved', 'bgGradient', 'from-[#ECE5DC] to-[#D5CABE]', 'previewHeroText', 'Extraction Lab',
      'approvalRecord', jsonb_build_object('approvedBy', 'Elena Rostova (Client)', 'approvedAt', to_char(now() - interval '1 day', 'Mon FMDD, YYYY, FMHH12:MI AM'), 'comment', 'Approved for scheduled publication.')
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'approved', 'Extraction Lab Micro-Cuts', 'Macro views of botanical oil distillation. Preserving cold-pressed bioactive nutrients.', 'Elena Rostova (Client)');

  -- Item 12: Approved (November Monthly Wrap)
  v_ts := now() + interval '14 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_kanso_id, 'November Monthly Wrap', 'post', 'approved',
    'November retrospective: 3,400 orders shipped and 12 sustainable harvests processed.',
    v_ts, ARRAY['instagram'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Post', 'statusLabel', 'Approved', 'bgGradient', 'from-[#DDD5CD] to-[#BFB4A8]', 'previewHeroText', 'Monthly Wrap',
      'approvalRecord', jsonb_build_object('approvedBy', 'Elena Rostova (Client)', 'approvedAt', to_char(now() - interval '1 day', 'Mon FMDD, YYYY, FMHH12:MI AM'), 'comment', 'Approved for scheduled publication.')
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'approved', 'November Monthly Wrap', 'November retrospective: 3,400 orders shipped and 12 sustainable harvests processed.', 'Elena Rostova (Client)');

  -- Item 13: Approved (Alta Living - Weekend Suite Tour)
  v_ts := now() - interval '7 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_alta_id, 'Weekend Suite Tour', 'carousel', 'approved',
    'Travertine architecture under morning solstice lighting. Reservations for penthouse suites are now open.',
    v_ts, ARRAY['instagram', 'pinterest'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Carousel', 'statusLabel', 'Approved', 'bgGradient', 'from-[#CFCBC8] to-[#ABA6A1]', 'previewHeroText', 'Alta Living', 'slideCount', 4,
      'approvalRecord', jsonb_build_object('approvedBy', 'Marcus Vance (Client)', 'approvedAt', to_char(v_ts - interval '1 day', 'Mon FMDD, YYYY, FMHH12:MI AM'), 'comment', 'Approved for scheduled publication.')
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'approved', 'Weekend Suite Tour', 'Travertine architecture under morning solstice lighting. Reservations for penthouse suites are now open.', 'Marcus Vance (Client)');

  -- Item 14: Approved (Maison Studio - Behind The Lens: AW24)
  v_ts := now() + interval '1 day';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_maison_id, 'Behind The Lens: AW24', 'reel', 'approved',
    '35mm film memories of the Paris winter collection staging. Direct cuts from Marc Delacroix.',
    v_ts, ARRAY['instagram', 'tiktok'], '9:16', 1,
    jsonb_build_object(
      'formatLabel', 'Reel', 'statusLabel', 'Approved', 'bgGradient', 'from-[#D6CCC3] to-[#B3A698]', 'previewHeroText', 'Maison Studio', 'duration', '0:28',
      'approvalRecord', jsonb_build_object('approvedBy', 'Marc Delacroix (Client)', 'approvedAt', to_char(now() - interval '1 day', 'Mon FMDD, YYYY, FMHH12:MI AM'), 'comment', 'Approved for scheduled publication.')
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'approved', 'Behind The Lens: AW24', '35mm film memories of the Paris winter collection staging. Direct cuts from Marc Delacroix.', 'Marc Delacroix (Client)');

  -- Item 15: Scheduled (Ceramics & Form - Terra Firma Drop Preview)
  v_ts := now() + interval '6 days';
  INSERT INTO public.content_items (client_id, title, format, status, caption, scheduled_at, channels, aspect_ratio, revision_count, metadata)
  VALUES (
    v_ceramics_id, 'Terra Firma Drop Preview', 'carousel', 'scheduled',
    'Macro focus on raw stoneware textures and uneven rim glazes ahead of the Terra Firma release. #CeramicsAndForm #ArtisanInterior',
    v_ts, ARRAY['instagram', 'pinterest'], '4:5', 1,
    jsonb_build_object(
      'formatLabel', 'Carousel', 'statusLabel', 'Scheduled', 'bgGradient', 'from-[#D9D3CA] to-[#BDB4A7]', 'previewHeroText', 'Ceramics & Form', 'slideCount', 3,
      'approvalRecord', jsonb_build_object('approvedBy', 'Hannah Vance (Client)', 'approvedAt', to_char(now() - interval '2 days', 'Mon FMDD, YYYY, FMHH12:MI AM'), 'comment', 'Approved for scheduled publication.')
    )
  ) RETURNING id INTO v_item_id;
  INSERT INTO public.content_revisions (content_item_id, revision_number, status, title, caption, reviewer_name)
  VALUES (v_item_id, 1, 'approved', 'Terra Firma Drop Preview', 'Macro focus on raw stoneware textures and uneven rim glazes ahead of the Terra Firma release.', 'Hannah Vance (Client)');

END $$;
