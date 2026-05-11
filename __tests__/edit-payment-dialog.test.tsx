import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditPaymentDialog } from "@/components/EditPaymentDialog";

vi.mock("@/app/actions", () => ({
  updatePayment: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockPayment = {
  id: 1,
  amount: "5000",
  description: "Rent payment for January",
};

describe("EditPaymentDialog", () => {
  it("renders trigger button", () => {
    render(<EditPaymentDialog payment={mockPayment} tenantId={1} />);
    expect(screen.getByTitle("Edit Payment")).toBeInTheDocument();
  });

  it("opens dialog on trigger click", async () => {
    const user = userEvent.setup();
    render(<EditPaymentDialog payment={mockPayment} tenantId={1} />);

    await user.click(screen.getByTitle("Edit Payment"));
    await waitFor(() => {
      expect(screen.getByText("Edit Payment")).toBeInTheDocument();
    });
  });

  it("pre-fills form fields with payment data", async () => {
    const user = userEvent.setup();
    render(<EditPaymentDialog payment={mockPayment} tenantId={1} />);

    await user.click(screen.getByTitle("Edit Payment"));
    await waitFor(() => {
      expect(screen.getByLabelText("Amount (₹)")).toHaveValue(5000);
      expect(screen.getByLabelText("Description")).toHaveValue("Rent payment for January");
    });
  });

  it("shows cancel button in dialog", async () => {
    const user = userEvent.setup();
    render(<EditPaymentDialog payment={mockPayment} tenantId={1} />);

    await user.click(screen.getByTitle("Edit Payment"));
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  it("shows save button in dialog", async () => {
    const user = userEvent.setup();
    render(<EditPaymentDialog payment={mockPayment} tenantId={1} />);

    await user.click(screen.getByTitle("Edit Payment"));
    await waitFor(() => {
      expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });
  });
});
