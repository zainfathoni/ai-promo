import { describe, expect, it } from "vitest";

import type { PromoEntry } from "./promos";
import {
  findDuplicateUrls,
  findFuzzyTitleMatches,
  normalizeTitle,
  normalizeUrl,
  titleSimilarity,
} from "./promo-validation";

const createEntry = (overrides: Partial<PromoEntry>): PromoEntry => ({
  id: "sample",
  title: "Sample Promo",
  description: "Sample description",
  category: "Models",
  url: "https://example.com/free",
  expiryDate: "Ongoing",
  source: "Example",
  sourceUrl: "https://example.com/free",
  ...overrides,
});

describe("promo validation", () => {
  it("normalizes URLs to hostname + pathname", () => {
    expect(normalizeUrl("https://www.Example.com/path/"))
      .toBe("example.com/path");
    expect(normalizeUrl("https://example.com/"))
      .toBe("example.com/");
  });

  it("normalizes titles", () => {
    expect(normalizeTitle("Hello, World!"))
      .toBe("hello world");
  });

  it("calculates title similarity", () => {
    expect(titleSimilarity("AI Promo", "AI Promo")).toBe(1);
    expect(titleSimilarity("AI Promo", "Different"))
      .toBe(0);
    expect(titleSimilarity("AI Promo", "AI Promo Offer"))
      .toBeCloseTo(0.8);
  });

  it("finds duplicate URLs", () => {
    const entries = [
      createEntry({ id: "one", url: "https://example.com/free" }),
      createEntry({ id: "two", url: "https://example.com/free/" }),
      createEntry({ id: "three", url: "https://example.com/other" }),
    ];

    const duplicates = findDuplicateUrls(entries);

    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].entries.map((entry) => entry.id))
      .toEqual(["one", "two"]);
  });

  it("finds fuzzy title matches", () => {
    const entries = [
      createEntry({ id: "one", title: "AI Promo Offer" }),
      createEntry({ id: "two", title: "AI Promo" }),
      createEntry({ id: "three", title: "Completely Different" }),
    ];

    const matches = findFuzzyTitleMatches(entries, 0.8);

    expect(matches).toHaveLength(1);
    expect(matches[0].entries.map((entry) => entry.id))
      .toEqual(["one", "two"]);
  });
});
