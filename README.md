# ai-promo

A simple community-driven list of AI promos, freebies, credits, and trial bundles.

## MVP Features

- Curated list of AI promo entries from local seed data
- Search by keyword
- Filter by category
- Active/Expired badge based on expiry date
- Easy contribution flow via GitHub Issues or PR

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Contributing

You can contribute in two ways:

1. **Open an issue** using the "Submit new promo" issue template
2. **Open a PR** using the PR template and add/update entries in `src/data/promos.ts`

### Data shape

Each promo entry should include:

- `title`
- `description`
- `category`
- `url`
- `expiryDate` (format: `YYYY-MM-DD`)

## Roadmap (Post-MVP)

- Source attribution per promo entry
- Voting/upvote signals
- Duplicate detection
- Auto-ingest from trusted feeds

---

Built with ❤️ for people who love promo dan gratisan.
