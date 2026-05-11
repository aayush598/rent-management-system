import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders with correct type", () => {
    render(<Input type="text" placeholder="Enter name" />);
    expect(screen.getByPlaceholderText("Enter name")).toHaveAttribute("type", "text");
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    await user.type(input, "Hello");
    expect(input).toHaveValue("Hello");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
