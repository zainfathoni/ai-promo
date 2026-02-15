"use client";

import { useMemo, useState } from "react";

import { promoEntries } from "@/data/promos";

const categories = ["All", ...new Set(promoEntries.map((entry) => entry.category))];

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const isActivePromo = (expiryDate: string) => {
  if (expiryDate === "Ongoing") {
    return true;
  }

  const expiry = new Date(`${expiryDate}T23:59:59`);
  return expiry.getTime() >= Date.now();
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const visibleEntries = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return promoEntries.filter((entry) => {
      const matchesCategory =
        selectedCategory === "All" || entry.category === selectedCategory;
      const matchesSearch =
        normalized.length === 0 ||
        entry.title.toLowerCase().includes(normalized) ||
        entry.description.toLowerCase().includes(normalized) ||
        entry.category.toLowerCase().includes(normalized);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-[#ffc9a5] opacity-40 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-[#ffd9b9] opacity-50 blur-3xl" />
        </div>
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-12 pt-16 animate-rise">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#a14c15]">
              Curated AI promos
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#5b5045]">
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1">
                {promoEntries.length} offers tracked
              </span>
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1">
                Updated weekly
              </span>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-[#2b211a] sm:text-5xl">
                ai-promo keeps every AI freebie, credit, and launch perk in one place.
              </h1>
              <p className="mt-4 text-lg text-[#5b5045]">
                Discover fresh credits, trials, and bundles from top AI tooling partners.
                Search the catalog or filter by category to plan your next build.
              </p>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.3)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a14c15]">
                Quick actions
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-[#5b5045]">
                <a
                  className="rounded-2xl border border-black/10 bg-[#fff4e8] px-4 py-3 font-medium text-[#2b211a] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
                  href="https://github.com/zainfathoni/ai-promo/issues/new"
                  target="_blank"
                  rel="noreferrer"
                >
                  Submit a promo entry
                </a>
                <a
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-medium text-[#2b211a] transition hover:-translate-y-0.5 hover:bg-[#fff4e8] hover:shadow-lg"
                  href="https://github.com/zainfathoni/ai-promo/pulls"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open a promo PR
                </a>
              </div>
            </div>
          </div>
        </header>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-4 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.3)] lg:grid-cols-[1.2fr_0.8fr] animate-rise">
          <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#a14c15]">
            Search promos
            <input
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base font-normal text-[#2b211a] shadow-sm outline-none transition focus:border-[#fe7f2d] focus:ring-2 focus:ring-[#fe7f2d]/30"
              placeholder="Search by name, category, or keyword"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#a14c15]">
            Category
            <select
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base font-normal text-[#2b211a] shadow-sm outline-none transition focus:border-[#fe7f2d] focus:ring-2 focus:ring-[#fe7f2d]/30"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-[#5b5045]">
          <span>
            Showing {visibleEntries.length} of {promoEntries.length} promos
          </span>
          <span className="font-medium text-[#a14c15]">
            Expired promos remain for reference
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {visibleEntries.map((entry) => {
            const isActive = isActivePromo(entry.expiryDate);

            return (
              <article
                key={entry.id}
                className="group flex h-full flex-col justify-between rounded-3xl border border-black/10 bg-[var(--surface)] p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#fe7f2d]/60 hover:shadow-[0_24px_45px_-28px_rgba(254,127,45,0.45)] animate-rise"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a14c15]">
                      {entry.category}
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-[#2b211a]">
                      {entry.title}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${
                      isActive
                        ? "bg-[#ffe8d4] text-[#a14c15]"
                        : "bg-[#e8e1da] text-[#7a6c60]"
                    }`}
                  >
                    {isActive ? "Active" : "Expired"}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#5b5045]">
                  {entry.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a14c15]">
                      {entry.expiryDate === "Ongoing" ? "Availability" : "Expires"}
                    </p>
                    <p className="text-sm font-medium text-[#2b211a]">
                      {entry.expiryDate === "Ongoing"
                        ? "Ongoing"
                        : formatter.format(new Date(entry.expiryDate))}
                    </p>
                  </div>
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#2b211a] transition group-hover:-translate-y-0.5 group-hover:border-[#fe7f2d]/60 group-hover:text-[#a14c15]"
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit offer
                    <span aria-hidden>→</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {visibleEntries.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-black/10 bg-white/70 p-10 text-center text-[#5b5045]">
            <p className="text-lg font-semibold text-[#2b211a]">
              No promos match your search.
            </p>
            <p className="mt-2">
              Try a different keyword or reset the category filter.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
