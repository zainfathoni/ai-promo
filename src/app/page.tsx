"use client";

import { useMemo, useState } from "react";

import { promoEntries } from "@/data/promos";
import { useTheme } from "@/app/theme-provider";

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
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

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
          <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-[var(--halo-1)] opacity-80 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-[var(--halo-2)] opacity-80 blur-3xl" />
        </div>
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-12 pt-16 animate-rise">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--panel-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Curated AI promos
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1">
                {promoEntries.length} offers tracked
              </span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1">
                Updated weekly
              </span>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
                ai-promo keeps every AI freebie, credit, and launch perk in one place.
              </h1>
              <p className="mt-4 text-lg text-[var(--muted)]">
                Discover fresh credits, trials, and bundles from top AI tooling partners.
                Search the catalog or filter by category to plan your next build.
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-6 shadow-[0_24px_60px_-40px_var(--shadow-color)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Quick actions
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--muted)]">
                <a
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--muted-bg)] px-4 py-3 font-medium text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--highlight)] hover:shadow-lg"
                  href="https://github.com/zainfathoni/ai-promo/issues/new?template=new-promo.yml"
                  target="_blank"
                  rel="noreferrer"
                >
                  Submit a promo entry
                </a>
                <a
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-3 font-medium text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--muted-bg)] hover:shadow-lg"
                  href="https://github.com/zainfathoni/ai-promo/pulls"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open a promo PR
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                <span>Theme</span>
                <div className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] p-1">
                  {(["system", "light", "dark"] as const).map((mode) => (
                    <button
                      key={mode}
                      className={`rounded-full px-3 py-1 text-[11px] transition ${
                        theme === mode
                          ? "bg-[var(--muted-bg)] text-[var(--accent-strong)]"
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                      type="button"
                      onClick={() => setTheme(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <button
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--highlight)] px-3 py-1 text-[11px] text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--muted-bg)]"
                  type="button"
                  onClick={toggleTheme}
                >
                  {resolvedTheme === "dark" ? "Switch to light" : "Switch to dark"}
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel)] p-6 shadow-[0_18px_40px_-30px_var(--shadow-color)] lg:grid-cols-[1.2fr_0.8fr] animate-rise">
          <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Search promos
            <input
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-3 text-base font-normal text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              placeholder="Search by name, category, or keyword"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Category
            <select
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-3 text-base font-normal text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
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

        <div className="mt-8 flex items-center justify-between text-sm text-[var(--muted)]">
          <span>
            Showing {visibleEntries.length} of {promoEntries.length} promos
          </span>
          <span className="font-medium text-[var(--accent-strong)]">
            Expired promos remain for reference
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {visibleEntries.map((entry) => {
            const isActive = isActivePromo(entry.expiryDate);

            return (
              <article
                key={entry.id}
                className="group flex h-full flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-[0_20px_40px_-30px_var(--shadow-color)] transition hover:-translate-y-1 hover:border-[var(--accent)]/60 hover:shadow-[0_24px_45px_-28px_rgba(249,164,90,0.35)] animate-rise"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                      {entry.category}
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--ink)]">
                      {entry.title}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${
                      isActive
                        ? "bg-[var(--muted-bg)] text-[var(--accent-strong)]"
                        : "bg-[var(--surface-strong)] text-[var(--muted-text)]"
                    }`}
                  >
                    {isActive ? "Active" : "Expired"}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  {entry.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                      {entry.expiryDate === "Ongoing" ? "Availability" : "Expires"}
                    </p>
                    <p className="text-sm font-medium text-[var(--ink)]">
                      {entry.expiryDate === "Ongoing"
                        ? "Ongoing"
                        : formatter.format(new Date(entry.expiryDate))}
                    </p>
                  </div>
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition group-hover:-translate-y-0.5 group-hover:border-[var(--accent)]/60 group-hover:text-[var(--accent-strong)]"
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
          <div className="mt-12 rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-10 text-center text-[var(--muted)]">
            <p className="text-lg font-semibold text-[var(--ink)]">
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
