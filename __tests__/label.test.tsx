import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders with text", () => {
    render(<Label>Full Name</Label>);
    expect(screen.getByText("Full Name")).toBeInTheDocument();
  });

  it("associates with input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="name">Name</Label>
        <input id="name" />
      </>,
    );
    expect(screen.getByText("Name")).toHaveAttribute("for", "name");
  });
});
