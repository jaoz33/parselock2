---
version: alpha
name: ParseLock
description: Compliance-grade document generation with strict operational clarity and data integrity.
colors:
  primary: '#12305e'
  primary-variant: '#2c4675'
  on-primary: '#ffffff'
  secondary: '#445e8f'
  secondary-variant: '#385282'
  on-secondary: '#ffffff'
  tertiary: '#865300'
  tertiary-container: '#cb831b'
  on-tertiary-container: '#412500'
  surface: '#f3f5f9'
  surface-variant: '#d8e2ff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d8e2ff'
  on-surface: '#12203a'
  on-surface-variant: '#3d4945'
  inverse-surface: '#23304b'
  inverse-on-surface: '#edf0ff'
  outline: '#6d7a75'
  outline-variant: '#bccac4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  teal: '#0fa68a'
  on-teal: '#003329'
  teal-container: '#0fa68a'
  teal-fixed: '#7df8d8'
  on-teal-fixed: '#002019'
  teal-fixed-dim: '#5edbbc'
  amber: '#f0a23b'
  on-amber: '#412500'
  amber-fixed: '#ffddb9'
  on-amber-fixed: '#2b1700'
  amber-fixed-dim: '#ffb963'
  background: '#f3f5f9'
  on-background: '#12203a'
  surface-tint: '#006b58'
typography:
  headline-xl:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
  headline-lg:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
  headline-md:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  headline-sm:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
  label-md:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-sm:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
  label-xs:
    fontFamily: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
  mono-cell:
    fontFamily: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.125rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
shapes:
  card: '{rounded.lg}'
  button: '{rounded.md}'
  input: '{rounded.md}'
  badge: '{rounded.full}'
  ad: '{rounded.sm}'
elevation:
  canvas: 0px
  card: 0px
  card-border: 1px
  floating: '0 4px 12px rgba(18, 48, 94, 0.08)'
  modal: '0 12px 32px rgba(18, 48, 94, 0.16)'
  backdrop: 'rgba(18, 32, 58, 0.6)'
components:
  button-primary:
    backgroundColor: '{colors.teal}'
    textColor: '{colors.on-teal}'
    rounded: '{rounded.md}'
    padding: 8px
    typography: '{typography.label-md}'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.primary}'
    border: '1.5px solid {colors.primary}'
    rounded: '{rounded.md}'
    padding: 8px
    typography: '{typography.label-md}'
  button-destructive:
    backgroundColor: 'transparent'
    textColor: '{colors.on-background}'
    border: '1.5px solid {colors.amber}'
    rounded: '{rounded.md}'
    padding: 8px
    typography: '{typography.label-md}'
  input:
    border: '1px solid {colors.outline-variant}'
    rounded: '{rounded.md}'
    padding: 10px
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    typography: '{typography.body-md}'
  card:
    backgroundColor: '{colors.surface}'
    border: '1px solid {colors.outline-variant}'
    rounded: '{rounded.lg}'
    padding: 16px
    shadow: '{elevation.card}'
  badge-success:
    backgroundColor: 'rgba(15, 166, 138, 0.12)'
    textColor: '{colors.teal}'
    rounded: '{rounded.full}'
    padding: 4px 10px
    typography: '{typography.label-xs}'
  badge-warning:
    backgroundColor: 'rgba(240, 162, 59, 0.12)'
    textColor: '{colors.amber}'
    rounded: '{rounded.full}'
    padding: 4px 10px
    typography: '{typography.label-xs}'
  ad-slot:
    backgroundColor: '#eef2f7'
    border: '1px solid {colors.outline-variant}'
    rounded: '{shapes.ad}'
    typography: '{typography.label-xs}'

## Overview

ParseLock is a compliance-grade document generation utility for Philippine knowledge workers and administrative operators. It merges Word templates with spreadsheet data entirely in-browser, preserving data privacy under RA 10173. The interface emphasizes operational integrity, deterministic status, and dense-but-legible data surfaces.

## Colors

- **Deep Navy (#12305e)**: Primary brand color for headers, navigation, and critical system badges.
- **Teal (#0fa68a)**: Success, validation, and primary actions. Also used for PII masking, data security, and non-reversible operations.
- **Amber (#f0a23b)**: Warning states, PII detections, and unencrypted column indicators. Light tint: `rgba(240, 162, 59, 0.12)`.
- **Surface (#f3f5f9)**: Default canvas background to reduce eye fatigue during long spreadsheet review sessions.
- **Card (#ffffff)**: Elevated panels, tables, and modal dialogs. Bordered, not shadowed, in the resting state.
- **Error (#ba1a1a)**: Destructive actions and validation failures.

### Dark Mode

- Canvas: `#0c1220`, cards: `#162038`, text: `#eaf0fb`, muted: `#93a0bb`, borders: `#26324f`.
- Navy adjusts to `#7fb0ff` for accessible hierarchy on dark surfaces.

## Typography

System font stack for zero layout shift and rapid client rendering. Tabular numerals (`font-variant-numeric: tabular-nums`) on all grid data, byte sizes, and masked outputs. Monospaced fallback (`mono-cell`) for tokens, validation rules, and salted hashes.

## Layout & Spacing

Responsive multi-tier grid:
- Mobile (<768px): 4-column, sticky bottom utility sheet, horizontally scrolling tables with fixed index column.
- Tablet (768px-1024px): 8-column, split-view tool panels above primary grid.
- Desktop (>1024px): 12-column with `2rem` margins and `1.5rem` gutters. Right rail: 300px contextual logs, audit summaries, and IAB ad banners (300x250, 300x600).

Compact density default: row padding adheres to `0.5rem` vertical spacing to maximize records per viewport height without infinite scroll pagination.

## Elevation & Depth

Border-first language; minimal shadow.

- **Canvas Tier 0**: `#f3f5f9` / `#0c1220` dark.
- **Card Tier 1**: `#ffffff` / `#162038` dark with 1px border only; no shadow at rest.
- **Floating Tier 2**: 1px border + `0 4px 12px rgba(18, 48, 94, 0.08)` light / `rgba(0,0,0,0.45)` dark.
- **Modal Tier 3**: Semi-translucent backdrop `rgba(18, 32, 58, 0.6)`, anchored shadow `0 12px 32px rgba(18, 48, 94, 0.16)`.

## Shapes

- Cards/data panels: 12px-14px radius (`0.75rem`-`0.875rem`).
- Buttons: 12px (`0.75rem`).
- Inputs/selects: 10px (`0.625rem`).
- Badges, pills, compliance chips: fully rounded (`9999px`).
- Ad containers: non-rounded or max 8px to distinguish from regulatory UI.

## Components

### Buttons

- **Primary**: Solid teal, white text, medium weight, 40px height. Hover `#0c8a73`. Active scale 0.99.
- **Secondary**: Navy outline with transparent fill.
- **Destructive**: Transparent with amber border and on-background text.

### Inputs & Dropdowns

- 38px height, 1px border, 10px radius, teal focus ring 2px.

### Excel Preview Tables

- Sticky header 32px, uppercase label-xs, 2px bottom border.
- Cells min 96px×30px, numbers right-aligned, strings left-aligned, tags centered.
- Selected cells: 2px teal outline with corner drag handle.
- Masked data: in-cell blur + `[MASKED - PII]` pill badge.

### Privacy & RA 10173 Compliance Badges

- **Compliant/Protected**: teal background 12% opacity, teal text, checkmark icon.
- **PII Detected/At Risk**: amber tint `#fef6ec`, amber border, on-background text, alert icon.
- **Statutory Notice**: navy text on `#dde3ee` chip with explicit "RA 10173 DPA" text.

### Cards & Ad Containers

- Content cards: 14px radius, white/dark surface, `1.5rem` padding, 1px border.
- Sponsored banners: rectangular, max 8px radius, permanent `label-xs` descriptor ("ADVERTISEMENT / SPONSORED") in muted text to separate promotion from regulatory operations.

### Checkboxes & Radios

- 18×18px box, 4px radius, 1.5px border. Checked: teal fill with white checkmark.
- Radio inner circle: 8px teal.

## Do's and Don'ts

- Do use teal for success and security actions; amber for warnings.
- Do keep buttons at 12px radius and inputs at 10px radius.
- Do use pill badges for compliance chips and masked indicators.
- Don't apply heavy drop shadows to cards at rest.
- Don't use rounded corners above 8px on ad containers.
- Don't place sponsored content inside data grids or form fields.
