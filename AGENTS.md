# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev           # Start Next.js dev server (http://localhost:3000)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript type checking
npm run test          # Run Vitest tests
npm run test:watch    # Run Vitest in watch mode
npm run validate      # Validate promo data for duplicates and fuzzy matches
```

All PRs must pass CI checks which run: `lint`, `typecheck`, `validate`, and `test`.

## Architecture

### Data-First Design
The entire app is driven by `src/data/promos.ts` which exports:
- `PromoCategory` union type of valid categories
- `PromoEntry` type defining the shape of promo data
- `promoEntries` array containing all promo entries

The main page (`src/app/page.tsx`) imports this data directly and provides client-side filtering, sorting, and search.

### Promo Validation
`src/data/promo-validation.ts` contains validation logic:
- `normalizeUrl()` - Normalizes URLs to hostname + pathname (no trailing slash, no www)
- `normalizeTitle()` - Normalizes titles for comparison
- `titleSimilarity()` - Calculates Dice coefficient similarity between titles
- `findDuplicateUrls()` - Finds entries with duplicate normalized URLs
- `findFuzzyTitleMatches()` - Finds entries with similar titles (default threshold: 0.9)

The `validate` script (`src/scripts/validate-promos.mjs`) runs these checks and exits with error if issues are found. Run it before committing promo changes.

### Theme System
Custom theme provider in `src/app/theme-provider.tsx`:
- Supports `light`, `dark`, and `system` preferences
- Persists to localStorage with key `ai-promo-theme`
- Sets `data-theme` and `color-scheme` on document element
- Provides `useTheme()` hook for components

### Testing
- Vitest with jsdom environment
- Testing Library for React components
- Test setup in `src/test/setup.ts`
- Tests colocated with source files as `*.test.ts` or `*.test.tsx`

### Styling
- Tailwind CSS v4 with PostCSS
- Custom CSS variables in `src/app/globals.css` for theming
- Design tokens referenced via `var(--token-name)`

## Adding New Promos

When adding a promo entry to `src/data/promos.ts`:

1. Create a unique, URL-safe `id` using lowercase words separated by hyphens
2. Include all required fields: `title`, `description`, `category`, `url`, `expiryDate`, `addedDate`, `source`, `sourceUrl`
3. Use ISO date format (`YYYY-MM-DD`) for dates, or `"Ongoing"` for active promos
4. Run `npm run validate` to check for duplicate URLs or similar titles
5. Run `npm run lint` and `npm run typecheck` before committing

## Adding New Categories

1. Update `PromoCategory` union in `src/data/promos.ts`
2. The category will automatically appear in the filter dropdown (derived from entries)

## Key File Locations

- `src/data/promos.ts` - All promo entries and type definitions
- `src/data/promo-validation.ts` - Validation logic for duplicate detection
- `src/app/page.tsx` - Main page with filtering, sorting, and search
- `src/app/theme-provider.tsx` - Custom theme context
- `src/app/layout.tsx` - Root layout with font configuration
- `src/scripts/validate-promos.mjs` - Promo validation CLI script
