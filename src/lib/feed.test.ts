import { describe, expect, it } from "vitest";

import { createAtomFeed, createRssFeed, getPromoFeedItems } from "@/lib/feed";
import { promoEntries } from "@/data/promos";

describe("promo feeds", () => {
  it("builds RSS with promo metadata", () => {
    const xml = createRssFeed({
      feedUrl: "https://example.com/feed.xml",
      siteUrl: "https://example.com",
      lastUpdated: new Date("2025-02-12T00:00:00Z"),
    });

    expect(xml).toContain("<rss");
    expect(xml).toContain("<channel>");
    expect(xml).toContain(promoEntries[0].title);
    expect(xml).toContain(promoEntries[0].description);
    expect(xml).toContain(promoEntries[0].url);
    expect(xml).toContain(promoEntries[0].expiryDate);
    expect(xml).toContain("application/rss+xml");
  });

  it("builds Atom entries with timestamps", () => {
    const xml = createAtomFeed({
      baseUrl: "https://example.com",
      feedUrl: "https://example.com/feed.xml",
      siteUrl: "https://example.com",
      lastUpdated: new Date("2025-02-12T00:00:00Z"),
    });

    expect(xml).toContain("<feed");
    expect(xml).toContain("<entry>");
    expect(xml).toContain("<summary>");
    expect(xml).toContain("<published>");
    expect(xml).toContain("<updated>");
  });

  it("sorts items by most recent added date", () => {
    const items = getPromoFeedItems();

    expect(items[0].title).toBe("Gemini API Free Tier");
  });
});
