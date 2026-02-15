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
    expect(screen.getAllByText("Visit offer")).toHaveLength(promoEntries.length);
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
