import { describe, expect, it } from "vitest";

import { promoEntries, promoTagOptions } from "@/data/promos";

const parseIsoDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

describe("promoEntries data", () => {
  it("uses unique ids", () => {
    const ids = promoEntries.map((entry) => entry.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it("uses valid, well-formed URLs", () => {
    const invalidUrls = promoEntries.filter((entry) => {
      try {
        new URL(entry.url);
        new URL(entry.sourceUrl);
        return false;
      } catch {
        return true;
      }
    });

    expect(invalidUrls).toEqual([]);
  });

  it("uses ISO expiry dates that parse or marks ongoing", () => {
    const invalidDates = promoEntries.filter((entry) => {
      if (entry.expiryDate === "Ongoing") {
        return false;
      }

      const parsed = parseIsoDate(entry.expiryDate);

      return parsed === null || entry.expiryDate !== parsed.toISOString().slice(0, 10);
    });

    expect(invalidDates).toEqual([]);
  });

  it("uses ISO added dates that parse", () => {
    const invalidDates = promoEntries.filter((entry) => {
      const parsed = parseIsoDate(entry.addedDate);

      return parsed === null || entry.addedDate !== parsed.toISOString().slice(0, 10);
    });

    expect(invalidDates).toEqual([]);
  });

  it("assigns known tags for every entry", () => {
    const validTags = new Set(promoTagOptions);
    const invalidTags = promoEntries.filter((entry) =>
      entry.tags.some((tag) => !validTags.has(tag)),
    );

    expect(invalidTags).toEqual([]);
  });
});
