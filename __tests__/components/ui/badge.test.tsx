import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-amber-100");
  });

  it("renders with success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toHaveClass("bg-emerald-100");
  });

  it("renders with warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText("Warning")).toHaveClass("bg-amber-100");
  });

  it("renders with danger variant", () => {
    render(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText("Danger")).toHaveClass("bg-red-100");
  });

  it("renders with outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveClass("border");
  });

  it("applies additional class names", () => {
    render(<Badge className="custom-badge">Styled</Badge>);
    expect(screen.getByText("Styled")).toHaveClass("custom-badge");
  });
});
