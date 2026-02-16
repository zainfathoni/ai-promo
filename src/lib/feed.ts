import { promoEntries } from "@/data/promos";
import { siteMetadata } from "@/lib/site";

export type FeedConfig = {
  baseUrl: string;
  feedUrl: string;
  siteUrl: string;
  lastUpdated?: Date;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatRfc822 = (date: Date) => date.toUTCString();

const formatIso = (date: Date) => date.toISOString();

const toDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildItemDescription = (entry: (typeof promoEntries)[number]) => {
  const expiry = entry.expiryDate === "Ongoing" ? "Ongoing" : entry.expiryDate;

  return [
    entry.description,
    `Offer URL: ${entry.url}`,
    `Expiry: ${expiry}`,
  ].join("\n");
};

export const getPromoFeedItems = () => {
  return promoEntries
    .map((entry) => {
      const published = toDate(entry.addedDate) ?? new Date();
      const updated =
        entry.expiryDate === "Ongoing"
          ? published
          : toDate(entry.expiryDate) ?? published;

      return {
        id: entry.id,
        title: entry.title,
        description: buildItemDescription(entry),
        url: entry.url,
        published,
        updated,
      };
    })
    .sort((a, b) => b.published.getTime() - a.published.getTime());
};

export const createRssFeed = ({ feedUrl, siteUrl, lastUpdated }: FeedConfig) => {
  const items = getPromoFeedItems();
  const updated = lastUpdated ?? (items[0]?.published ?? new Date());

  const itemXml = items
    .map((item) => {
      return [
        "<item>",
        `<guid>${escapeXml(item.id)}</guid>`,
        `<title>${escapeXml(item.title)}</title>`,
        `<link>${escapeXml(item.url)}</link>`,
        `<description>${escapeXml(item.description)}</description>`,
        `<pubDate>${formatRfc822(item.published)}</pubDate>`,
        "</item>",
      ].join("");
    })
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(siteMetadata.title)}</title>`,
    `<description>${escapeXml(siteMetadata.description)}</description>`,
    `<link>${escapeXml(siteUrl)}</link>`,
    `<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    `<lastBuildDate>${formatRfc822(updated)}</lastBuildDate>`,
    itemXml,
    "</channel>",
    "</rss>",
  ].join("");
};

export const createAtomFeed = ({ baseUrl, feedUrl, siteUrl, lastUpdated }: FeedConfig) => {
  const items = getPromoFeedItems();
  const updated = lastUpdated ?? (items[0]?.published ?? new Date());

  const itemXml = items
    .map((item) => {
      return [
        "<entry>",
        `<id>${escapeXml(`${baseUrl}/promos/${item.id}`)}</id>`,
        `<title>${escapeXml(item.title)}</title>`,
        `<link href="${escapeXml(item.url)}" />`,
        `<summary>${escapeXml(item.description)}</summary>`,
        `<published>${formatIso(item.published)}</published>`,
        `<updated>${formatIso(item.updated)}</updated>`,
        "</entry>",
      ].join("");
    })
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `<id>${escapeXml(baseUrl)}</id>`,
    `<title>${escapeXml(siteMetadata.title)}</title>`,
    `<subtitle>${escapeXml(siteMetadata.description)}</subtitle>`,
    `<link href="${escapeXml(siteUrl)}" />`,
    `<link href="${escapeXml(feedUrl)}" rel="self" />`,
    `<updated>${formatIso(updated)}</updated>`,
    itemXml,
    "</feed>",
  ].join("");
};
