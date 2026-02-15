# ai-promo

[![CI](https://github.com/zainfathoni/ai-promo/actions/workflows/ci.yml/badge.svg)](https://github.com/zainfathoni/ai-promo/actions/workflows/ci.yml)
[![Vercel Deploy](https://vercelbadge.vercel.app/api/zainfathoni/ai-promo)](https://ai-promo.zainf.dev)

A simple community-driven list of AI promos, freebies, credits, and trial bundles.

**Live Demo:** https://ai-promo.zainf.dev

![ai-promo preview](https://image.thum.io/get/width/1200/https://ai-promo.zainf.dev)

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
