import { render, screen } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("renders with default classes", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-lg");
    expect(skeleton).toHaveClass("bg-slate-200");
  });

  it("renders with custom className", () => {
    render(<Skeleton className="h-10 w-full" data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("h-10");
    expect(skeleton).toHaveClass("w-full");
  });

  it("renders with custom dimensions via style", () => {
    render(<Skeleton style={{ width: 200, height: 50 }} data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveStyle({ width: "200px", height: "50px" });
  });
});
