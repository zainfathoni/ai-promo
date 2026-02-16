import { NextResponse } from "next/server";

import { createRssFeed } from "@/lib/feed";

const buildBaseUrl = (requestUrl: string) => {
  const parsed = new URL(requestUrl);
  return parsed.origin;
};

export const GET = (request: Request) => {
  const baseUrl = buildBaseUrl(request.url);
  const feedUrl = `${baseUrl}/feed.xml`;
  const siteUrl = baseUrl;
  const xml = createRssFeed({ baseUrl, feedUrl, siteUrl });

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
