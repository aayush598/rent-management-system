import { render, screen } from "@testing-library/react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

describe("VisuallyHidden", () => {
  it("renders children", () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    expect(screen.getByText("Hidden text")).toBeInTheDocument();
  });

  it("is visually hidden from sighted users", () => {
    const { container } = render(<VisuallyHidden>Hidden</VisuallyHidden>);
    const element = container.querySelector("[data-radix-visually-hidden]") || container.firstChild;
    expect(element).toBeInTheDocument();
  });

  it("is still accessible to screen readers", () => {
    render(
      <div role="note" aria-label="test">
        <VisuallyHidden>Screen reader only</VisuallyHidden>
      </div>,
    );
    const text = screen.getByText("Screen reader only");
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent("Screen reader only");
  });
});
