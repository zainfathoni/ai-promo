import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import Home from "@/app/[locale]/page";
import { promoEntries } from "@/data/promos";
import { ThemeProvider } from "@/app/theme-provider";
import enMessages from "../../messages/en.json";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const newestPromoTitle = [...promoEntries]
  .sort((a, b) => {
    const aTimestamp = Date.parse(`${a.addedDate}T00:00:00Z`);
    const bTimestamp = Date.parse(`${b.addedDate}T00:00:00Z`);

    if (aTimestamp === bTimestamp) {
      return a.title.localeCompare(b.title, "en", { sensitivity: "base" });
    }

    return bTimestamp - aTimestamp;
  })[0]?.title;

if (!newestPromoTitle) {
  throw new Error("Expected at least one promo entry for tests.");
}

const renderHome = () =>
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <ThemeProvider>
        <Home />
      </ThemeProvider>
    </NextIntlClientProvider>,
  );

describe("Home page", () => {
  it("renders the promo list and search controls", () => {
    renderHome();

    expect(screen.getByText(enMessages.header.badge)).toBeInTheDocument();
    expect(screen.getByLabelText(enMessages.filters.searchLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(enMessages.filters.category)).toBeInTheDocument();
    expect(screen.getByLabelText(enMessages.filters.sortBy)).toBeInTheDocument();
    expect(screen.getByText(enMessages.filters.tagFilters)).toBeInTheDocument();
    expect(screen.getAllByText(enMessages.cards.visitOffer)).toHaveLength(
      Math.min(12, promoEntries.length),
    );
  });

  it("filters by search term", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(screen.getByLabelText(enMessages.filters.searchLabel), "Gemini");

    expect(screen.getByText("Gemini API Free Tier")).toBeInTheDocument();
    expect(screen.queryByText("ElevenLabs Free Plan")).not.toBeInTheDocument();
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.selectOptions(screen.getByLabelText(enMessages.filters.category), "Design");

    expect(screen.getByText("Stability AI API Free Credits")).toBeInTheDocument();
    expect(screen.queryByText("Gemini API Free Tier")).not.toBeInTheDocument();
  });

  it("filters by tags", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole("button", { name: enMessages.tags.credits }));

    expect(screen.getByText("Deepgram $200 Free Credit")).toBeInTheDocument();
    expect(screen.queryByText("Gemini API Free Tier")).not.toBeInTheDocument();
  });

  it("shows the reset button when tags are active and clears tags", async () => {
    const user = userEvent.setup();
    renderHome();

    expect(
      screen.queryByRole("button", { name: enMessages.filters.resetFiltersAria }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: enMessages.tags.credits }));

    const resetButton = screen.getByRole("button", {
      name: enMessages.filters.resetFiltersAria,
    });
    expect(resetButton).toBeInTheDocument();
    expect(screen.queryByText("Gemini API Free Tier")).not.toBeInTheDocument();

    await user.click(resetButton);

    expect(screen.getByText(newestPromoTitle)).toBeInTheDocument();
  });

  it("resets all filters together", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(screen.getByLabelText(enMessages.filters.searchLabel), "Gemini");
    await user.selectOptions(screen.getByLabelText(enMessages.filters.category), "Models");
    await user.selectOptions(
      screen.getByLabelText(enMessages.filters.sortBy),
      "Alphabetical",
    );
    await user.click(screen.getByRole("button", { name: enMessages.tags.credits }));

    const resetButton = screen.getByRole("button", {
      name: enMessages.filters.resetFiltersAria,
    });

    await user.click(resetButton);

    expect(screen.getByLabelText(enMessages.filters.searchLabel)).toHaveValue("");
    expect(screen.getByLabelText(enMessages.filters.category)).toHaveValue("All");
    expect(screen.getByLabelText(enMessages.filters.sortBy)).toHaveValue("Newest");
    expect(screen.getByRole("button", { name: enMessages.filters.all })).toHaveClass(
      "border-[var(--accent)]",
    );
    expect(screen.getByText(newestPromoTitle)).toBeInTheDocument();
  });

  it("sorts entries alphabetically", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.selectOptions(
      screen.getByLabelText(enMessages.filters.sortBy),
      "Alphabetical",
    );

    const visitButtons = screen.getAllByText(enMessages.cards.visitOffer);
    const titles = visitButtons.map((button) =>
      button.closest("article")?.querySelector("h3")?.textContent?.trim(),
    );

    const expectedTitles = [...promoEntries]
      .sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }))
      .map((entry) => entry.title);

    const pagedExpected = expectedTitles.slice(0, titles.length);

    expect(titles[0]).toBe(pagedExpected[0]);
    expect(titles[titles.length - 1]).toBe(pagedExpected[pagedExpected.length - 1]);
  });

  it("sorts entries by newest first", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.selectOptions(screen.getByLabelText(enMessages.filters.sortBy), "Newest");

    const visitButtons = screen.getAllByText(enMessages.cards.visitOffer);
    const titles = visitButtons.map((button) =>
      button.closest("article")?.querySelector("h3")?.textContent?.trim(),
    );

    const expectedTitles = [...promoEntries]
      .sort((a, b) => {
        const aTimestamp = Date.parse(`${a.addedDate}T00:00:00Z`);
        const bTimestamp = Date.parse(`${b.addedDate}T00:00:00Z`);

        if (aTimestamp === bTimestamp) {
          return a.title.localeCompare(b.title, "en", { sensitivity: "base" });
        }

        return bTimestamp - aTimestamp;
      })
      .map((entry) => entry.title);

    expect(titles[0]).toBe(expectedTitles[0]);
  });

  it("shows an empty state when no entries match", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(screen.getByLabelText(enMessages.filters.searchLabel), "NoMatch");

    expect(screen.getByText(enMessages.empty.noMatch)).toBeInTheDocument();
  });

  it("lets visitors change the theme", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole("button", { name: enMessages.header.theme.dark }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
