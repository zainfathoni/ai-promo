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

    await user.type(screen.getByLabelText("Search promos"), "LangSmith");

    expect(screen.getByText("LangSmith Team Trial")).toBeInTheDocument();
    expect(screen.queryByText("OpenAI Startup Credits")).not.toBeInTheDocument();
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.selectOptions(screen.getByLabelText("Category"), "Design");

    expect(screen.getByText("Figma AI UI Kit")).toBeInTheDocument();
    expect(screen.queryByText("OpenAI Startup Credits")).not.toBeInTheDocument();
  });

  it("shows an empty state when no entries match", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByLabelText("Search promos"), "NoMatch");

    expect(screen.getByText("No promos match your search.")).toBeInTheDocument();
  });
});
