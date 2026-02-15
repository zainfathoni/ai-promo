import { describe, expect, it } from "vitest";

import { promoEntries } from "@/data/promos";

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
});
