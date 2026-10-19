---
name: Aura Editorial Agency
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#464555'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5f5e60'
  on-secondary: '#ffffff'
  secondary-container: '#e5e1e4'
  on-secondary-container: '#656466'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e5e1e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1c1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: 1.5rem
    letterSpacing: -0.02em
  title-md:
    fontFamily: Geist
    fontSize: 0.9375rem
    fontWeight: '500'
    lineHeight: 1.375rem
    letterSpacing: -0.015em
  body-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: -0.01em
  body-sm:
    fontFamily: Geist
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: '0'
  label-md:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Geist
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the intersection of high-end editorial clarity and modern engineering precision—drawing inspiration from Linear's utilitarian efficiency, Notion's quiet typography, and Apple's restrained spatial staging. Built for creative social agencies and discerning clients, the interface establishes a calm, distraction-free gallery where visual media commands absolute focus.

### Design Principles
- **Gallery-First Restraint:** Chrome and controls recede into translucent layers and crisp hairline geometries, ensuring agency assets (reels, carousels, key visuals) remain the definitive focal points.
- **Micro-Deliberation:** Every state transition, badge, and indicator is rendered with micro-precision. Whitespace functions as an intentional architectural material rather than mere void.
- **Direct, Calm Editorial:** Copy and data density remain measured and quiet, replacing typical dashboard friction with effortless scanning and confident executive readability.

## Colors

The system uses a luminous, high-key neutral foundation layered with clinical ink blacks and an exact electric indigo accent. High-saturation tints are strictly partitioned into functional feedback roles.

### Color Tiers
- **Canvas Base:** `#FAFAFA` acts as the main app backdrop, paired with pure white (`#FFFFFF`) card containers and `#F4F4F5` secondary wells.
- **Hairline Dividers:** Crisp boundaries are achieved using `rgba(9, 9, 11, 0.06)` or `#E4E4E7` across all card perimeters and nested toolbars.
- **Text & Hierarchy:**
  - Ink Primary: `#09090B` (High emphasis headlines, primary data, active states)
  - Muted Secondary: `#71717A` (Body text, subheadings, labels)
  - Ghost Tertiary: `#A1A1AA` (Timestamps, placeholders, inactive icons)
- **Primary Accent:** `#4F46E5` (Electric Indigo), applied exclusively to high-intent actions, active pagination dots, and keyboard selection rings.

### Status Palette (Pill Badges)
- **Pending Review:** `#FEF3C7` surface, `#D97706` text, hairline border in `#FDE68A`.
- **Changes Requested:** `#FEE2E2` surface, `#DC2626` text, hairline border in `#FECACA`.
- **Approved / Published:** `#DCFCE7` surface, `#16A34A` text, hairline border in `#BBF7D0`.
- **Scheduled:** `#EEF2FF` surface, `#4F46E5` text, hairline border in `#E0E7FF`.

## Typography

Geist provides the structural backbone across all typographic roles. Its optical balance and tight, neutral letterforms deliver programmatic clarity without appearing overly technical.

### Application Guidance
- **Headings:** Apply tight tracking (`-0.02em` to `-0.03em`) on all headline styles to create compact, publication-grade titling.
- **Body & Meta:** Keep operational text restrained between 13px (`body-sm`) and 14px (`body-md`). Avoid heavy paragraph walls; use itemized metadata keys and inline summaries.
- **Caps & Micro Labels:** Use `label-caps` strictly for metadata identifiers (e.g., `ASPECT RATIO`, `TIMESTAMP`, `VERSION`) with positive letter spacing (`0.06em`) and uppercase transformation.

## Layout & Spacing

The spatial engine runs on a strict 8-point base module, favoring broad, ventilated gutters to preserve visual separation between rich multimedia assets.

### Grid & Breakpoints
- **Desktop (1280px+):** 12-column responsive fluid grid with `2.5rem` outer margins and `1.5rem` internal gutters. Sidebar sits fixed at 260px.
- **Tablet (768px - 1279px):** 8-column layout with `1.5rem` margins and `1rem` gutters. Left-hand navigation collapses to a slim icon rail (64px).
- **Mobile (<768px):** 4-column layout with `1rem` margins and `0.75rem` gutters. Content cascades into a single vertical stream with sticky bottom review bars.

### Editorial Staging
Cards hosting 4:5 carousels and 9:16 stories must maintain breathing room: surround media card groups with `space-xl` gaps, avoiding cluttered edge-to-edge grids.

## Elevation & Depth

Visual hierarchy avoids heavy, dark dropshadows. Elevation is achieved through translucent surfaces, 1px hairline boundaries, and diffused whisper shadows.

### Elevation Levels
- **Base Level (Canvas):** Flat `#FAFAFA`, no shadow.
- **Level 1 (Card & Containers):** Pure `#FFFFFF` surface enclosed in a 1px solid `rgba(9, 9, 11, 0.06)` outline, supported by a whisper shadow:
  `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02);`
- **Level 2 (Dropdowns, Popovers & Context Menus):** Pure `#FFFFFF` surface with `box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.03);` and hairline stroke.
- **Level 3 (Modal & Media Lightbox Overlays):** Deep modal backdrop blur (`backdrop-filter: blur(12px); background-color: rgba(9, 9, 11, 0.4);`) paired with high-clarity floating viewport surfaces.
- **Floating Controls (Media Players, Zoom Tools):** Frosted floating pills (`background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.4);`).

## Shapes

The geometric architecture relies on rounded profiles balanced against square media assets:

- **Interactive Core (Inputs, Buttons, Pills):** 8px (`rounded-md` / base roundedness token `2`) for structured utility. Status tags and filter pills use full circular radiuses (9999px).
- **Card Containers:** 12px to 16px (`rounded-xl` to `rounded-2xl`) to softly frame complex editorial feeds.
- **Internal Media Frames:** Media clips nested inside cards strictly mirror parent curvatures using 8px to 12px radii, preserving clean concentricity with surrounding container borders.

## Components

### Buttons
- **Primary:** `#09090B` background, `#FFFFFF` text, subtle hover lift via `rgba(9, 9, 11, 0.9)`. 8px border-radius, 36px standard height (`space-sm` vertical, `space-md` horizontal).
- **Secondary:** Surface `#FFFFFF`, hairline border `1px solid #E4E4E7`, text `#09090B`. Hover fills with `#F4F4F5`.
- **Accent Action:** Electric Indigo (`#4F46E5`) reserved strictly for final approvals and live publishing triggers.

### Media Viewport Cards
- **Feed Item (4:5):** Card wrapper housing 4:5 vertical media frames, accompanied by a clean metadata footer containing caption diffs, account avatar, scheduled slot, and status tag.
- **Reel / Story Card (9:16):** Tall vertical viewport with absolute floating play controls, duration indicator, and an interactive scrubber bar at the top edge.
- **Carousel Controls:** Ghost circular arrow discs (`32px` diameter, frosted glass background) docked at horizontal center margins, fading in on cursor proximity.

### Status Pills & Badges
- Pill shape (`border-radius: 9999px`), 22px height, `label-md` font size. Padding: 2px top/bottom, 8px left/right. Hairline outline tint matched precisely to status type. Include a 6px solid circular indicator dot preceding text for instant accessibility.

### Input Fields & Controls
- **Inputs:** 36px height, crisp `#FFFFFF` background, `1px solid #E4E4E7`. On focus: `border-color: #4F46E5` accompanied by an indigo whisper focus ring (`box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08)`).
- **Checkboxes & Radios:** Minimalist square/circle geometries with `#09090B` fill on checked states and white micro-check icons.

### Client Feedback & Comment Bubbles
- Inline feedback nodes pinned directly over media coordinates. Circular numbered pins (`24px`, `#09090B` surface, white text) that expand on click into threaded conversation tooltips with real-time status resolution actions.