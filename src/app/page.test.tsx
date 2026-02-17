import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Home from "@/app/page";
import { promoEntries } from "@/data/promos";
import { ThemeProvider } from "@/app/theme-provider";

const renderHome = () =>
  render(
    <ThemeProvider>
      <Home />
    </ThemeProvider>,
  );

describe("Home page", () => {
  it("renders the promo list and search controls", () => {
    renderHome();

    expect(screen.getByText("Curated AI promos")).toBeInTheDocument();
    expect(screen.getByLabelText("Search promos")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
    expect(screen.getByText("Tag filters")).toBeInTheDocument();
    expect(screen.getAllByText("Visit offer")).toHaveLength(
      Math.min(12, promoEntries.length),
    );
  });

  it("filters by search term", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(screen.getByLabelText("Search promos"), "Gemini");

    expect(screen.getByText("Gemini API Free Tier")).toBeInTheDocument();
    expect(screen.queryByText("ElevenLabs Free Plan")).not.toBeInTheDocument();
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.selectOptions(screen.getByLabelText("Category"), "Design");

    expect(screen.getByText("Stability AI API Free Credits")).toBeInTheDocument();
    expect(screen.queryByText("Gemini API Free Tier")).not.toBeInTheDocument();
  });

  it("filters by tags", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole("button", { name: "credits" }));

    expect(screen.getByText("Deepgram $200 Free Credit")).toBeInTheDocument();
    expect(screen.queryByText("Gemini API Free Tier")).not.toBeInTheDocument();
  });

  it("shows the reset button when tags are active and clears tags", async () => {
    const user = userEvent.setup();
    renderHome();

    expect(
      screen.queryByRole("button", { name: "Reset all filters to default" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "credits" }));

    const resetButton = screen.getByRole("button", {
      name: "Reset all filters to default",
    });
    expect(resetButton).toBeInTheDocument();
    expect(screen.queryByText("Gemini API Free Tier")).not.toBeInTheDocument();

    await user.click(resetButton);

    expect(screen.getByText("Gemini API Free Tier")).toBeInTheDocument();
  });

  it("resets all filters together", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(screen.getByLabelText("Search promos"), "Gemini");
    await user.selectOptions(screen.getByLabelText("Category"), "Models");
    await user.selectOptions(screen.getByLabelText("Sort by"), "Alphabetical");
    await user.click(screen.getByRole("button", { name: "credits" }));

    const resetButton = screen.getByRole("button", {
      name: "Reset all filters to default",
    });

    await user.click(resetButton);

    expect(screen.getByLabelText("Search promos")).toHaveValue("");
    expect(screen.getByLabelText("Category")).toHaveValue("All");
    expect(screen.getByLabelText("Sort by")).toHaveValue("Newest");
    expect(screen.getByRole("button", { name: "All" })).toHaveClass(
      "border-[var(--accent)]",
    );
    expect(screen.getByText("Gemini API Free Tier")).toBeInTheDocument();
  });

  it("sorts entries alphabetically", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.selectOptions(screen.getByLabelText("Sort by"), "Alphabetical");

    const visitButtons = screen.getAllByText("Visit offer");
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

    await user.selectOptions(screen.getByLabelText("Sort by"), "Newest");

    const visitButtons = screen.getAllByText("Visit offer");
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

    await user.type(screen.getByLabelText("Search promos"), "NoMatch");

    expect(screen.getByText("No promos match your search.")).toBeInTheDocument();
  });

  it("lets visitors change the theme", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole("button", { name: "dark" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
