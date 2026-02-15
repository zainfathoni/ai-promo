import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Home from "@/app/page";
import { promoEntries } from "@/data/promos";

describe("Home page", () => {
  it("renders the promo list and search controls", () => {
    render(<Home />);

    expect(screen.getByText("Curated AI promos")).toBeInTheDocument();
    expect(screen.getByLabelText("Search promos")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getAllByText("Visit offer")).toHaveLength(promoEntries.length);
  });

  it("filters by search term", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByLabelText("Search promos"), "Gemini");

    expect(screen.getByText("Gemini API Free Tier")).toBeInTheDocument();
    expect(screen.queryByText("ElevenLabs Free Plan")).not.toBeInTheDocument();
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.selectOptions(screen.getByLabelText("Category"), "Design");

    expect(screen.getByText("Stability AI API Free Credits")).toBeInTheDocument();
    expect(screen.queryByText("Gemini API Free Tier")).not.toBeInTheDocument();
  });

  it("shows an empty state when no entries match", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByLabelText("Search promos"), "NoMatch");

    expect(screen.getByText("No promos match your search.")).toBeInTheDocument();
  });
});
