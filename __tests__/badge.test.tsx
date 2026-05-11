import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders children correctly", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { container } = render(<Badge variant="success">Paid</Badge>);
    expect(container.firstChild).toHaveClass("bg-emerald-100");
  });

  it("defaults to default variant", () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass("bg-indigo-100");
  });
});
