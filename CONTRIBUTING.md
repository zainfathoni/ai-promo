# Contributing to ai-promo

Thanks for helping keep the AI promo catalog fresh. This guide explains how to submit new promos, how the data should look, and what to expect during review.

## Ways to contribute

You can contribute in two ways:

1. **Submit a promo via GitHub Issues** using the "New promo entry" issue template.
2. **Open a pull request** with the promo added to the data file.

If you are unsure about the data format or the promo needs discussion, start with an issue. If you already have all the details, feel free to jump straight to a PR.

## Fork and set up locally

1. Fork the repository on GitHub.
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/ai-promo.git
cd ai-promo
```

3. Install dependencies:

```bash
npm install
```

4. Run the app locally:

```bash
npm run dev
```

Then open http://localhost:3000.

## Submit a new promo via GitHub Issues

Use the issue template at `.github/ISSUE_TEMPLATE/new-promo.yml`. Provide all required fields:

- Promo title
- Description (1-2 sentences)
- Category (Models, Design, Hosting, Productivity, Developer Tools, Analytics)
- URL to the official promo page
- Expiry date (ISO format: `YYYY-MM-DD`)
- Status (Active/Expired)
- Additional notes (optional)

We will review the submission, verify the promo, and add it to the catalog.

## Submit a new promo via Pull Request

If you want to add the promo directly:

1. Create a branch.
2. Add the promo entry to `src/data/promos.ts`.
3. Follow the PR checklist in `.github/pull_request_template.md`.

### Data format

Each entry in `promoEntries` must match the `PromoEntry` type:

- `id`: URL-safe, unique identifier (use lowercase words separated by hyphens).
- `title`: Short promo name.
- `description`: 1-2 sentences describing the offer.
- `category`: One of the supported categories listed in `PromoCategory`.
- `url`: Official promo URL.
- `expiryDate`: Use `YYYY-MM-DD` or `Ongoing`.
- `source`: Short name for the source (e.g., "OpenAI pricing", "Vendor blog").
- `sourceUrl`: URL where the promo details are verified.

### Validation rules

- Use real, public promo URLs (no tracking or affiliate links).
- Verify the offer is still active, or mark it as expired with an accurate date.
- Prefer the most authoritative source for `sourceUrl` (official pricing page, help center, or blog).
- Keep descriptions factual and concise.

### Finding and verifying promos

- Use official vendor pages, docs, or release notes.
- Check eligibility requirements (startup programs, region limits, free tiers, etc.).
- Confirm the expiry date or note that it is ongoing.

### Adding new categories

If the existing categories do not fit the promo:

1. Update the `PromoCategory` union in `src/data/promos.ts`.
2. Use the new category for your promo entry.
3. Mention the new category in your PR summary so maintainers can review it for consistency.

## Code style and checks

- Run `npm run lint` to ensure ESLint passes.
- Run `npm run build` to confirm the app builds.
- Keep formatting consistent with the existing codebase (Prettier/ESLint).

## Review process

Maintainers will:

- Verify the promo details and source URL.
- Check that the data format is correct.
- Ask for changes if information is missing or unclear.
- Merge when everything looks good.

## Code of conduct

Be respectful and constructive in issues, PRs, and discussions. Harassment, discrimination, or hostile behavior will not be tolerated.

If you are unsure about any part of the process, open an issue and we will help you out.
