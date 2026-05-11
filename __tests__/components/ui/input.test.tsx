import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders with default attributes", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("flex");
    expect(input).toHaveClass("h-10");
  });

  it("renders different input types", () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="number" />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");
  });

  it("applies additional class names", () => {
    render(<Input className="extra-class" />);
    expect(screen.getByRole("textbox")).toHaveClass("extra-class");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("handles value changes", async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "hello");
    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards ref to the underlying element", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("renders with aria-invalid attribute", () => {
    render(<Input aria-invalid={true} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("has correct displayName", () => {
    expect(Input.displayName).toBe("Input");
  });
});
