import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders label text", () => {
    render(<Label>Username</Label>);
    const label = screen.getByText("Username");
    expect(label).toBeInTheDocument();
  });

  it("applies htmlFor attribute", () => {
    render(<Label htmlFor="username">Username</Label>);
    const label = screen.getByText("Username");
    expect(label).toHaveAttribute("for", "username");
  });

  it("applies additional class names", () => {
    render(<Label className="custom-label">Styled</Label>);
    expect(screen.getByText("Styled")).toHaveClass("custom-label");
  });

  it("renders with correct typography styles", () => {
    render(<Label>Label Text</Label>);
    const label = screen.getByText("Label Text");
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
  });
});
