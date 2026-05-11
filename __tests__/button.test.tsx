import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass("bg-red-600");
  });

  it("applies size classes", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild).toHaveClass("h-9");
  });

  it("handles click events", async () => {
    let clicked = false;
    render(
      <Button
        onClick={() => {
          clicked = true;
        }}
      >
        Click
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders as child when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
