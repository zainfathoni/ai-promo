import type { PromoEntry } from "./promos";

export type DuplicateUrlGroup = {
  normalizedUrl: string;
  entries: PromoEntry[];
};

export type FuzzyTitleMatch = {
  similarity: number;
  entries: [PromoEntry, PromoEntry];
};

export const normalizeUrl = (url: string) => {
  const parsed = new URL(url);
  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const pathname = parsed.pathname.replace(/\/+$/, "") || "/";

  return `${hostname}${pathname}`;
};

export const normalizeTitle = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenizeTitle = (title: string) => {
  const normalized = normalizeTitle(title);
  return normalized.length === 0 ? [] : normalized.split(" ");
};

export const titleSimilarity = (left: string, right: string) => {
  const leftTokens = new Set(tokenizeTitle(left));
  const rightTokens = new Set(tokenizeTitle(right));

  if (leftTokens.size === 0 && rightTokens.size === 0) {
    return 1;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  return (2 * intersection) / (leftTokens.size + rightTokens.size);
};

export const findDuplicateUrls = (entries: PromoEntry[]) => {
  const urlMap = new Map<string, PromoEntry[]>();

  for (const entry of entries) {
    const normalized = normalizeUrl(entry.url);
    const existing = urlMap.get(normalized);
    if (existing) {
      existing.push(entry);
    } else {
      urlMap.set(normalized, [entry]);
    }
  }

  return Array.from(urlMap.entries())
    .filter(([, grouped]) => grouped.length > 1)
    .map(([normalizedUrl, grouped]) => ({
      normalizedUrl,
      entries: grouped,
    }));
};

export const findFuzzyTitleMatches = (
  entries: PromoEntry[],
  threshold = 0.9,
): FuzzyTitleMatch[] => {
  const matches: FuzzyTitleMatch[] = [];

  for (let index = 0; index < entries.length; index += 1) {
    for (let j = index + 1; j < entries.length; j += 1) {
      const similarity = titleSimilarity(entries[index].title, entries[j].title);
      if (similarity >= threshold) {
        matches.push({
          similarity,
          entries: [entries[index], entries[j]],
        });
      }
    }
  }

  return matches;
};

export const validatePromoEntries = (entries: PromoEntry[], threshold = 0.9) => {
  const duplicateUrls = findDuplicateUrls(entries);
  const fuzzyTitleMatches = findFuzzyTitleMatches(entries, threshold);

  return {
    duplicateUrls,
    fuzzyTitleMatches,
    hasIssues: duplicateUrls.length > 0 || fuzzyTitleMatches.length > 0,
  };
};
