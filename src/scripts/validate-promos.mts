type PromoEntriesModule = typeof import("../data/promos");
type PromoValidationModule = typeof import("../data/promo-validation");

const promosModule = (await import("../data/promos")) as PromoEntriesModule;
const promoValidationModule =
  (await import("../data/promo-validation")) as PromoValidationModule;

const { promoEntries } = promosModule;
const { findDuplicateUrls, findFuzzyTitleMatches } = promoValidationModule;

const TITLE_SIMILARITY_THRESHOLD = 0.9;

const formatEntry = (entry: typeof promoEntries[number]) =>
  `${entry.title} (${entry.id}) -> ${entry.url}`;

const duplicateUrls = findDuplicateUrls(promoEntries);
const fuzzyTitleMatches = findFuzzyTitleMatches(
  promoEntries,
  TITLE_SIMILARITY_THRESHOLD,
);

if (duplicateUrls.length === 0 && fuzzyTitleMatches.length === 0) {
  console.log("Promo validation passed: no duplicate URLs or fuzzy title matches.");
  process.exit(0);
}

if (duplicateUrls.length > 0) {
  console.error("Duplicate promo URLs detected:\n");
  for (const group of duplicateUrls) {
    console.error(`- ${group.normalizedUrl}`);
    for (const entry of group.entries) {
      console.error(`  - ${formatEntry(entry)}`);
    }
  }
  console.error("\nNormalize check uses hostname + pathname (no trailing slash).");
}

if (fuzzyTitleMatches.length > 0) {
  if (duplicateUrls.length > 0) {
    console.error("");
  }
  console.error(
    `Fuzzy title matches detected (similarity >= ${TITLE_SIMILARITY_THRESHOLD}):\n`,
  );
  for (const match of fuzzyTitleMatches) {
    const [left, right] = match.entries;
    console.error(
      `- ${left.title} <-> ${right.title} (score ${match.similarity.toFixed(2)})`,
    );
    console.error(`  - ${formatEntry(left)}`);
    console.error(`  - ${formatEntry(right)}`);
  }
  console.error("\nAdjust wording or remove duplicates before submitting.");
}

process.exit(1);
