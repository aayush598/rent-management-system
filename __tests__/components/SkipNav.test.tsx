import { render, screen } from "@testing-library/react";
import { SkipNav } from "@/components/SkipNav";

describe("SkipNav", () => {
  it("renders a skip link", () => {
    render(<SkipNav />);
    const link = screen.getByRole("link", { name: /skip to main content/i });
    expect(link).toBeInTheDocument();
  });

  it("links to #main-content", () => {
    render(<SkipNav />);
    const link = screen.getByRole("link", { name: /skip to main content/i });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("is visually hidden until focused", () => {
    render(<SkipNav />);
    const link = screen.getByRole("link", { name: /skip to main content/i });
    expect(link).toHaveClass("sr-only");
  });

  it("has visible styles when focused", () => {
    render(<SkipNav />);
    const link = screen.getByRole("link", { name: /skip to main content/i });
    expect(link.className).toContain("focus:not-sr-only");
    expect(link.className).toContain("focus:bg-amber-500");
    expect(link.className).toContain("focus:text-white");
  });
});
