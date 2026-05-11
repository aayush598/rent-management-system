import { render, screen } from "@testing-library/react";
import { Toaster } from "@/components/ui/sonner";

describe("Toaster", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders toaster component with region role", () => {
    render(<Toaster />);
    const region = screen.getByRole("region");
    expect(region).toBeInTheDocument();
  });

  it("renders with notifications label", () => {
    render(<Toaster />);
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-label", "Notifications alt+T");
  });

  it("has aria-live polite for accessibility", () => {
    render(<Toaster />);
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-live", "polite");
  });
});
