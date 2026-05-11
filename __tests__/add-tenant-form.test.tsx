import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTenantForm } from "@/components/AddTenantForm";

vi.mock("@/app/actions", () => ({
  createTenant: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("AddTenantForm", () => {
  it("renders all form fields", () => {
    render(<AddTenantForm />);
    expect(screen.getByLabelText("Tenant Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Family Members")).toBeInTheDocument();
    expect(screen.getByLabelText("Base Rent (₹)")).toBeInTheDocument();
    expect(screen.getByLabelText("Water (₹/mo)")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<AddTenantForm />);
    expect(screen.getByRole("button", { name: /save tenant/i })).toBeInTheDocument();
  });

  it("shows validation error for empty name", async () => {
    const user = userEvent.setup();
    render(<AddTenantForm />);

    await user.clear(screen.getByLabelText("Tenant Name"));
    await user.click(screen.getByRole("button", { name: /save tenant/i }));

    await waitFor(() => {
      expect(screen.getByText(/tenant name is required/i)).toBeInTheDocument();
    });
  });

  it("has correct input types", () => {
    render(<AddTenantForm />);
    expect(screen.getByLabelText("Family Members")).toHaveAttribute("type", "number");
    expect(screen.getByLabelText("Base Rent (₹)")).toHaveAttribute("type", "number");
    expect(screen.getByLabelText("Water (₹/mo)")).toHaveAttribute("type", "number");
  });

  it("populates name field correctly", async () => {
    const user = userEvent.setup();
    render(<AddTenantForm />);

    const nameInput = screen.getByLabelText("Tenant Name");
    await user.type(nameInput, "John Doe");
    expect(nameInput).toHaveValue("John Doe");
  });
});
