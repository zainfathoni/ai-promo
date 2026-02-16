"use client";

import { useMemo, useState } from "react";

import { promoEntries, promoTagOptions, type PromoEntry, type PromoTag } from "@/data/promos";
import { useTheme } from "@/app/theme-provider";

const RefreshIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="14"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 3v5h-5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 21v-5h5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const categories = ["All", ...new Set(promoEntries.map((entry) => entry.category))];
const tagFilters = ["All", ...promoTagOptions];

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const sortOptions = [
  "Expiring soon",
  "Newest",
  "Alphabetical",
  "Category",
] as const;

type SortOption = (typeof sortOptions)[number];

const isActivePromo = (expiryDate: string) => {
  if (expiryDate === "Ongoing") {
    return true;
  }

  const expiry = new Date(`${expiryDate}T23:59:59`);
  return expiry.getTime() >= Date.now();
};

const toTimestamp = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

const compareTitle = (a: PromoEntry, b: PromoEntry) =>
  a.title.localeCompare(b.title, "en", { sensitivity: "base" });

const compareCategory = (a: PromoEntry, b: PromoEntry) => {
  const categoryResult = a.category.localeCompare(b.category, "en", {
    sensitivity: "base",
  });

  return categoryResult !== 0 ? categoryResult : compareTitle(a, b);
};

const compareExpiry = (a: PromoEntry, b: PromoEntry) => {
  const aExpiry = a.expiryDate === "Ongoing" ? null : toTimestamp(a.expiryDate);
  const bExpiry = b.expiryDate === "Ongoing" ? null : toTimestamp(b.expiryDate);

  if (aExpiry === null && bExpiry === null) {
    return compareTitle(a, b);
  }

  if (aExpiry === null) {
    return 1;
  }

  if (bExpiry === null) {
    return -1;
  }

  return aExpiry - bExpiry;
};

const compareNewest = (a: PromoEntry, b: PromoEntry) => {
  const aAdded = toTimestamp(a.addedDate) ?? 0;
  const bAdded = toTimestamp(b.addedDate) ?? 0;

  if (aAdded === bAdded) {
    return compareTitle(a, b);
  }

  return bAdded - aAdded;
};

const sortEntries = (entries: PromoEntry[], sortBy: SortOption) => {
  const sorted = [...entries];

  switch (sortBy) {
    case "Expiring soon":
      return sorted.sort(compareExpiry);
    case "Alphabetical":
      return sorted.sort(compareTitle);
    case "Category":
      return sorted.sort(compareCategory);
    case "Newest":
    default:
      return sorted.sort(compareNewest);
  }
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showExpired, setShowExpired] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const { activeEntries, expiredEntries } = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    const filtered = promoEntries.filter((entry) => {
      const matchesCategory =
        selectedCategory === "All" || entry.category === selectedCategory;
      const matchesTags =
        selectedTags.size === 0 ||
        Array.from(selectedTags).every((tag) => entry.tags.includes(tag as PromoTag));
      const matchesSearch =
        normalized.length === 0 ||
        entry.title.toLowerCase().includes(normalized) ||
        entry.description.toLowerCase().includes(normalized) ||
        entry.category.toLowerCase().includes(normalized) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(normalized));

      return matchesCategory && matchesTags && matchesSearch;
    });

    const sorted = sortEntries(filtered, sortBy);
    const active = sorted.filter((entry) => isActivePromo(entry.expiryDate));
    const expired = sorted.filter((entry) => !isActivePromo(entry.expiryDate));

    return { activeEntries: active, expiredEntries: expired };
  }, [searchTerm, selectedCategory, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);

      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }

      return next;
    });
  };

  const clearTags = () => {
    setSelectedTags(new Set());
  };

  const totalVisible = activeEntries.length + (showExpired ? expiredEntries.length : 0);

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-[var(--halo-1)] opacity-80 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-[var(--halo-2)] opacity-80 blur-3xl" />
        </div>
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16 animate-rise">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--panel-strong)] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)] sm:text-xs sm:tracking-[0.3em]">
              Curated AI promos
            </div>
            <div className="flex w-full flex-wrap items-center gap-3 text-xs text-[var(--muted)] sm:w-auto sm:gap-4 sm:text-sm">
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
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl lg:text-5xl">
                ai-promo keeps every AI freebie, credit, and launch perk in one place.
              </h1>
              <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
                Discover fresh credits, trials, and bundles from top AI tooling partners.
                Search the catalog or filter by category to plan your next build.
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-6 shadow-[0_24px_60px_-40px_var(--shadow-color)]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)] sm:text-sm">
                Quick actions
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--muted)]">
                <a
                  className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--muted-bg)] px-4 py-3 text-center font-medium text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--highlight)] hover:shadow-lg"
                  href="https://github.com/zainfathoni/ai-promo/issues/new?template=new-promo.yml"
                  target="_blank"
                  rel="noreferrer"
                >
                  Submit a promo entry
                </a>
                <a
                  className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-3 text-center font-medium text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--muted-bg)] hover:shadow-lg"
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

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel)] p-6 shadow-[0_18px_40px_-30px_var(--shadow-color)] lg:grid-cols-[1.1fr_0.65fr_0.55fr] animate-rise">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)] sm:text-sm sm:tracking-[0.2em]">
            Search promos
            <input
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-3 text-base font-normal text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              placeholder="Search by name, category, or keyword"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)] sm:text-sm sm:tracking-[0.2em]">
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
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)] sm:text-sm sm:tracking-[0.2em]">
            Sort by
            <select
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-3 text-base font-normal text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-5 shadow-[0_12px_32px_-28px_var(--shadow-color)] animate-rise">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)] sm:text-sm">
              Tag filters
            </p>
            {selectedTags.size > 0 && (
              <button
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--highlight)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)] transition hover:-translate-y-0.5 hover:bg-[var(--muted-bg)]"
                type="button"
                onClick={clearTags}
              >
                Clear tags
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tagFilters.map((tag) => {
              const isAll = tag === "All";
              const isActive = isAll ? selectedTags.size === 0 : selectedTags.has(tag);

              return (
                <button
                  key={tag}
                  className={`rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--highlight)] text-[var(--accent-strong)]"
                      : "border-[var(--border-subtle)] bg-[var(--chip-bg)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                  type="button"
                  onClick={() => {
                    if (isAll) {
                      clearTags();
                      return;
                    }

                    toggleTag(tag);
                  }}
                >
                  {tag.replace(/-/g, " ")}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <span>
            Showing {totalVisible} of {promoEntries.length} promos
          </span>
          <div className="flex flex-wrap items-center gap-4">
            {(searchTerm !== "" || selectedCategory !== "All" || sortBy !== "Newest" || showExpired || selectedTags.size > 0) && (
              <button
                aria-label="Reset all filters to default"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-4 py-2.5 font-medium text-[var(--accent-strong)] shadow-sm transition-all duration-200 hover:bg-[var(--muted-bg)] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 active:translate-y-0"
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSortBy("Newest");
                  setShowExpired(false);
                  clearTags();
                }}
              >
                <RefreshIcon />
                <span>Reset filters</span>
              </button>
            )}
            {expiredEntries.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2 font-medium text-[var(--accent-strong)]">
                <input
                  type="checkbox"
                  checked={showExpired}
                  onChange={(e) => setShowExpired(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border-subtle)] bg-[var(--highlight)] text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                />
                Show {expiredEntries.length} expired promo{expiredEntries.length !== 1 ? "s" : ""}
              </label>
            )}
          </div>
        </div>

        {activeEntries.length === 0 && expiredEntries.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-8 text-center text-[var(--muted)] sm:p-10">
            <p className="text-base font-semibold text-[var(--ink)] sm:text-lg">
              No promos match your search.
            </p>
            <p className="mt-2">
              Try a different keyword or reset the category filter.
            </p>
          </div>
        ) : (
          <>
            {activeEntries.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  Active Promos ({activeEntries.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {activeEntries.map((entry) => (
                    <article
                      key={entry.id}
                      className="group flex h-full flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-[0_20px_40px_-30px_var(--shadow-color)] transition hover:-translate-y-1 hover:border-[var(--accent)]/60 hover:shadow-[0_24px_45px_-28px_rgba(249,164,90,0.35)] animate-rise"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)] sm:text-xs sm:tracking-[0.3em]">
                            {entry.category}
                          </p>
                          <h3 className="mt-3 font-display text-xl font-semibold text-[var(--ink)] sm:text-2xl">
                            {entry.title}
                          </h3>
                        </div>
                        <span className="rounded-full bg-[var(--muted-bg)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)] sm:text-xs sm:tracking-[0.15em]">
                          Active
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                        {entry.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={`${entry.id}-${tag}`}
                            className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]"
                          >
                            {tag.replace(/-/g, " ")}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)] sm:text-xs sm:tracking-[0.2em]">
                            {entry.expiryDate === "Ongoing" ? "Availability" : "Expires"}
                          </p>
                          <p className="text-sm font-medium text-[var(--ink)]">
                            {entry.expiryDate === "Ongoing"
                              ? "Ongoing"
                              : formatter.format(new Date(entry.expiryDate))}
                          </p>
                        </div>
                        <a
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition group-hover:-translate-y-0.5 group-hover:border-[var(--accent)]/60 group-hover:text-[var(--accent-strong)] sm:w-auto"
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit offer
                          <span aria-hidden>→</span>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {showExpired && expiredEntries.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Expired Promos ({expiredEntries.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {expiredEntries.map((entry) => (
                    <article
                      key={entry.id}
                      className="group flex h-full flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 opacity-60 shadow-[0_20px_40px_-30px_var(--shadow-color)] transition hover:opacity-80 animate-rise"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] sm:text-xs sm:tracking-[0.3em]">
                            {entry.category}
                          </p>
                          <h3 className="mt-3 font-display text-xl font-semibold text-[var(--ink)] sm:text-2xl">
                            {entry.title}
                          </h3>
                        </div>
                        <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)] sm:text-xs sm:tracking-[0.15em]">
                          Expired
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                        {entry.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={`${entry.id}-${tag}`}
                            className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]"
                          >
                            {tag.replace(/-/g, " ")}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">
                            Expired
                          </p>
                          <p className="text-sm font-medium text-[var(--ink)]">
                            {formatter.format(new Date(entry.expiryDate))}
                          </p>
                        </div>
                        <a
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-2 text-sm font-semibold text-[var(--muted)] transition group-hover:text-[var(--ink)] sm:w-auto"
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View offer
                          <span aria-hidden>→</span>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
