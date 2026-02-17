"use client";

import { useEffect, useMemo, useState } from "react";

import {
  promoCategoryOptions,
  promoEntries,
  promoTagOptions,
  type PromoEntry,
  type PromoTag,
} from "@/data/promos";
import { useTheme } from "@/app/theme-provider";
import { HeartIcon, RefreshIcon } from "@/components/icons";
import { PromoStructuredData } from "@/components/promo-structured-data";
import { siteMetadata } from "@/lib/site";

const categories = ["All", ...promoCategoryOptions];
const tagFilters = ["All", ...promoTagOptions];

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const formatOptionalDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatter.format(parsed);
};

const sortOptions = [
  "Expiring soon",
  "Newest",
  "Alphabetical",
  "Category",
] as const;

const ITEMS_PER_PAGE = 12;
const FAVORITES_STORAGE_KEY = "ai-promo:favorites";

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

const getPromoAnchorId = (entry: PromoEntry) => `promo-${entry.id}`;

const findEntryByAnchorId = (anchorId: string) =>
  promoEntries.find((entry) => getPromoAnchorId(entry) === anchorId) ?? null;

function loadFavoritesFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return new Set();
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((s): s is string => typeof s === "string"));
    }
  } catch (error) {
    console.warn("Failed to parse saved favorites", error);
  }
  return new Set();
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showExpired, setShowExpired] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedAnchorId, setCopiedAnchorId] = useState<string | null>(null);
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(null);
  const [highlightedAnchorId, setHighlightedAnchorId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(loadFavoritesFromStorage);
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (typeof window.localStorage?.setItem !== "function") {
      return;
    }

    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(Array.from(favorites)),
    );
  }, [favorites]);

  const { activeEntries, expiredEntries, sortedEntries } = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    const filtered = promoEntries.filter((entry) => {
      const matchesCategory =
        selectedCategory === "All" || entry.category === selectedCategory;
      const matchesTags =
        selectedTags.size === 0 ||
        Array.from(selectedTags).every((tag) => entry.tags.includes(tag as PromoTag));
      const matchesFavorites = !showFavorites || favorites.has(entry.id);
      const matchesSearch =
        normalized.length === 0 ||
        entry.title.toLowerCase().includes(normalized) ||
        entry.description.toLowerCase().includes(normalized) ||
        entry.category.toLowerCase().includes(normalized) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(normalized));

      return matchesCategory && matchesTags && matchesFavorites && matchesSearch;
    });

    const sorted = sortEntries(filtered, sortBy);
    const active = sorted.filter((entry) => isActivePromo(entry.expiryDate));
    const expired = sorted.filter((entry) => !isActivePromo(entry.expiryDate));

    return { activeEntries: active, expiredEntries: expired, sortedEntries: sorted };
  }, [favorites, searchTerm, selectedCategory, selectedTags, showFavorites, sortBy]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleHashChange = () => {
      const rawHash = window.location.hash.replace("#", "");
      const nextAnchor = rawHash ? decodeURIComponent(rawHash) : null;
      setActiveAnchorId(nextAnchor);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const visibleEntries = showExpired ? sortedEntries : activeEntries;
  const totalVisible = visibleEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalVisible / ITEMS_PER_PAGE));

  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;
  const pagedEntries = visibleEntries.slice(pageStart, pageEnd);
  const pagedActiveEntries = pagedEntries.filter((entry) => isActivePromo(entry.expiryDate));
  const pagedExpiredEntries = pagedEntries.filter((entry) => !isActivePromo(entry.expiryDate));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const scheduleUpdate = (update: () => void) => {
      window.setTimeout(update, 0);
    };

    if (!activeAnchorId) {
      scheduleUpdate(() => setHighlightedAnchorId(null));
      return;
    }

    const entry = findEntryByAnchorId(activeAnchorId);

    if (!entry) {
      scheduleUpdate(() => setHighlightedAnchorId(null));
      return;
    }

    if (!showExpired && !isActivePromo(entry.expiryDate)) {
      scheduleUpdate(() => setShowExpired(true));
      return;
    }

    const entryIndex = visibleEntries.findIndex((item) => item.id === entry.id);

    if (entryIndex === -1) {
      scheduleUpdate(() => setHighlightedAnchorId(null));
      return;
    }

    const nextPage = Math.max(1, Math.ceil((entryIndex + 1) / ITEMS_PER_PAGE));

    if (nextPage !== currentPage) {
      scheduleUpdate(() => setCurrentPage(nextPage));
    }
  }, [activeAnchorId, visibleEntries, currentPage, showExpired]);

  useEffect(() => {
    if (!activeAnchorId) {
      return;
    }

    const scrollToAnchor = () => {
      const element = document.getElementById(activeAnchorId);

      if (!element) {
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedAnchorId(activeAnchorId);
    };

    const timeout = window.setTimeout(scrollToAnchor, 120);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [activeAnchorId, pagedEntries]);

  useEffect(() => {
    if (!highlightedAnchorId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setHighlightedAnchorId(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [highlightedAnchorId]);

  useEffect(() => {
    if (!activeAnchorId) {
      return;
    }

    const entry = findEntryByAnchorId(activeAnchorId);

    if (!entry) {
      return;
    }

    document.title = `${entry.title} | ${siteMetadata.title}`;

    const ensureMetaTag = (property: string, content: string) => {
      const selector = `meta[property="${property}"]`;
      let tag = document.querySelector(selector) as HTMLMetaElement | null;

      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }

      tag.setAttribute("content", content);
    };

    ensureMetaTag("og:title", entry.title);
    ensureMetaTag("og:description", entry.description);

    return () => {
      document.title = siteMetadata.title;
      const ogTitle = document.querySelector("meta[property='og:title']");
      const ogDescription = document.querySelector("meta[property='og:description']");

      if (ogTitle) {
        ogTitle.setAttribute("content", siteMetadata.title);
      }

      if (ogDescription) {
        ogDescription.setAttribute("content", siteMetadata.description);
      }
    };
  }, [activeAnchorId]);

  const resetPagination = () => {
    setCurrentPage(1);
  };

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
    resetPagination();
  };

  const toggleFavorite = (promoId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);

      if (next.has(promoId)) {
        next.delete(promoId);
      } else {
        next.add(promoId);
      }

      return next;
    });
  };

  const handleCopyLink = async (entry: PromoEntry) => {
    if (typeof window === "undefined") {
      return;
    }

    const anchorId = getPromoAnchorId(entry);
    const url = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(anchorId)}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        tempInput.remove();
      }

      setCopiedAnchorId(anchorId);
      window.setTimeout(() => {
        setCopiedAnchorId((current) => (current === anchorId ? null : current));
      }, 1800);
    } catch (error) {
      console.error("Failed to copy promo link", error);
    }
  };

  const pageSummary =
    totalVisible === 0
      ? "Showing 0 of 0 promos"
      : `Showing ${pageStart + 1}-${Math.min(pageEnd, totalVisible)} of ${totalVisible} promos`;
  const favoritesCount = favorites.size;
  const favoritesCountLabel = favoritesCount;
  const noFavoritesYet = showFavorites && favoritesCount === 0;

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="min-h-screen">
      <PromoStructuredData />
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
              onChange={(event) => {
                setSearchTerm(event.target.value);
                resetPagination();
              }}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)] sm:text-sm sm:tracking-[0.2em]">
            Category
            <select
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-3 text-base font-normal text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                resetPagination();
              }}
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
              onChange={(event) => {
                setSortBy(event.target.value as SortOption);
                resetPagination();
              }}
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
                  resetPagination();
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
            {pageSummary}
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <button
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
                showFavorites
                  ? "border-[var(--accent)] bg-[var(--highlight)] text-[var(--accent-strong)]"
                  : "border-[var(--border-subtle)] bg-[var(--chip-bg)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              type="button"
              onClick={() => {
                setShowFavorites((prev) => !prev);
                resetPagination();
              }}
            >
              <HeartIcon filled={showFavorites} />
              <span>My favorites</span>
              <span className="rounded-full bg-[var(--muted-bg)] px-2 py-0.5 text-[0.6rem] font-semibold text-[var(--accent-strong)]">
                {favoritesCountLabel}
              </span>
            </button>
            {(searchTerm !== "" || selectedCategory !== "All" || sortBy !== "Newest" || showExpired || selectedTags.size > 0 || showFavorites) && (
              <button
                aria-label="Reset all filters to default"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-4 py-2.5 font-medium text-[var(--accent-strong)] shadow-sm transition-all duration-200 hover:bg-[var(--muted-bg)] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 active:translate-y-0"
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSortBy("Newest");
                  setShowExpired(false);
                  setShowFavorites(false);
                  resetPagination();
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
                  onChange={(e) => {
                    setShowExpired(e.target.checked);
                    resetPagination();
                  }}
                  className="h-4 w-4 rounded border-[var(--border-subtle)] bg-[var(--highlight)] text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                />
                Show {expiredEntries.length} expired promo{expiredEntries.length !== 1 ? "s" : ""}
              </label>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div
            className="mt-6 flex flex-col gap-3 rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4 shadow-[0_12px_30px_-26px_var(--shadow-color)] sm:flex-row sm:items-center sm:justify-between"
            role="navigation"
            aria-label="Promo pagination"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)] sm:text-sm">
              Page {safePage} of {totalPages}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition hover:-translate-y-0.5 hover:bg-[var(--muted-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={handlePreviousPage}
                disabled={safePage === 1}
                aria-label="Go to previous page"
              >
                Prev
              </button>
              <button
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--highlight)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)] transition hover:-translate-y-0.5 hover:bg-[var(--muted-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={handleNextPage}
                disabled={safePage === totalPages}
                aria-label="Go to next page"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {activeEntries.length === 0 && expiredEntries.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-8 text-center text-[var(--muted)] sm:p-10">
            <p className="text-base font-semibold text-[var(--ink)] sm:text-lg">
              {noFavoritesYet ? "No favorites yet." : "No promos match your search."}
            </p>
            <p className="mt-2">
              {noFavoritesYet
                ? "Tap the heart on a promo to save it here."
                : "Try a different keyword or reset the category filter."}
            </p>
          </div>
        ) : (
          <>
            {pagedActiveEntries.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  Active Promos ({activeEntries.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {pagedActiveEntries.map((entry) => {
                    const anchorId = getPromoAnchorId(entry);
                    const isCopied = copiedAnchorId === anchorId;
                    const isHighlighted = highlightedAnchorId === anchorId;
                    const verifiedLabel = formatOptionalDate(entry.verifiedAt);

                    return (
                      <article
                        key={entry.id}
                        id={anchorId}
                        className={`group flex h-full flex-col justify-between rounded-3xl border bg-[var(--surface)] p-6 shadow-[0_20px_40px_-30px_var(--shadow-color)] transition hover:-translate-y-1 hover:border-[var(--accent)]/60 hover:shadow-[0_24px_45px_-28px_rgba(249,164,90,0.35)] animate-rise ${
                          isHighlighted
                            ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/40"
                            : "border-[var(--border-subtle)]"
                        }`}
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
                          <div className="flex flex-col items-end gap-2">
                            <span className="rounded-full bg-[var(--muted-bg)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)] sm:text-xs sm:tracking-[0.15em]">
                              Active
                            </span>
                            {verifiedLabel && (
                              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--highlight)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)] sm:text-xs sm:tracking-[0.15em]">
                                Verified {verifiedLabel}
                              </span>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                className={`inline-flex items-center justify-center rounded-full border px-2 py-2 transition ${
                                  favorites.has(entry.id)
                                    ? "border-[var(--accent)] bg-[var(--highlight)] text-[var(--accent-strong)]"
                                    : "border-[var(--border-subtle)] bg-[var(--chip-bg)] text-[var(--muted)] hover:text-[var(--ink)]"
                                }`}
                                type="button"
                                onClick={() => toggleFavorite(entry.id)}
                                aria-pressed={favorites.has(entry.id)}
                                aria-label={
                                  favorites.has(entry.id)
                                    ? `Remove ${entry.title} from favorites`
                                    : `Save ${entry.title} to favorites`
                                }
                              >
                                <HeartIcon filled={favorites.has(entry.id)} />
                              </button>
                              <button
                                className={`rounded-full border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition ${
                                  isCopied
                                    ? "border-[var(--accent)] bg-[var(--highlight)] text-[var(--accent-strong)]"
                                    : "border-[var(--border-subtle)] bg-[var(--chip-bg)] text-[var(--muted)] hover:text-[var(--ink)]"
                                }`}
                                type="button"
                                onClick={() => handleCopyLink(entry)}
                              >
                                {isCopied ? "Copied!" : "Copy link"}
                              </button>
                            </div>
                          </div>
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
                          {entry.submittedBy && (
                            <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                              Submitted by {entry.submittedBy}
                            </span>
                          )}
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
                            {entry.sourceUrl && (
                              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                                <a
                                  className="transition hover:text-[var(--ink)]"
                                  href={entry.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Source
                                </a>
                              </p>
                            )}
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
                    );
                  })}
                </div>
              </div>
            )}

            {showExpired && pagedExpiredEntries.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Expired Promos ({expiredEntries.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {pagedExpiredEntries.map((entry) => {
                    const anchorId = getPromoAnchorId(entry);
                    const isCopied = copiedAnchorId === anchorId;
                    const isHighlighted = highlightedAnchorId === anchorId;
                    const verifiedLabel = formatOptionalDate(entry.verifiedAt);

                    return (
                      <article
                        key={entry.id}
                        id={anchorId}
                        className={`group flex h-full flex-col justify-between rounded-3xl border bg-[var(--surface)] p-6 opacity-60 shadow-[0_20px_40px_-30px_var(--shadow-color)] transition hover:opacity-80 animate-rise ${
                          isHighlighted
                            ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/40"
                            : "border-[var(--border-subtle)]"
                        }`}
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
                          <div className="flex flex-col items-end gap-2">
                            <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)] sm:text-xs sm:tracking-[0.15em]">
                              Expired
                            </span>
                            {verifiedLabel && (
                              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--highlight)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)] sm:text-xs sm:tracking-[0.15em]">
                                Verified {verifiedLabel}
                              </span>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                className={`inline-flex items-center justify-center rounded-full border px-2 py-2 transition ${
                                  favorites.has(entry.id)
                                    ? "border-[var(--accent)] bg-[var(--highlight)] text-[var(--accent-strong)]"
                                    : "border-[var(--border-subtle)] bg-[var(--chip-bg)] text-[var(--muted)] hover:text-[var(--ink)]"
                                }`}
                                type="button"
                                onClick={() => toggleFavorite(entry.id)}
                                aria-pressed={favorites.has(entry.id)}
                                aria-label={
                                  favorites.has(entry.id)
                                    ? `Remove ${entry.title} from favorites`
                                    : `Save ${entry.title} to favorites`
                                }
                              >
                                <HeartIcon filled={favorites.has(entry.id)} />
                              </button>
                              <button
                                className={`rounded-full border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition ${
                                  isCopied
                                    ? "border-[var(--accent)] bg-[var(--highlight)] text-[var(--accent-strong)]"
                                    : "border-[var(--border-subtle)] bg-[var(--chip-bg)] text-[var(--muted)] hover:text-[var(--ink)]"
                                }`}
                                type="button"
                                onClick={() => handleCopyLink(entry)}
                              >
                                {isCopied ? "Copied!" : "Copy link"}
                              </button>
                            </div>
                          </div>
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
                          {entry.submittedBy && (
                            <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                              Submitted by {entry.submittedBy}
                            </span>
                          )}
                        </div>
                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">
                              Expired
                            </p>
                            <p className="text-sm font-medium text-[var(--ink)]">
                              {formatter.format(new Date(entry.expiryDate))}
                            </p>
                            {entry.sourceUrl && (
                              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                                <a
                                  className="transition hover:text-[var(--ink)]"
                                  href={entry.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Source
                                </a>
                              </p>
                            )}
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
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
