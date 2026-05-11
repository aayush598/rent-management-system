import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

describe("Dialog", () => {
  it("renders trigger button", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <p>Dialog body content</p>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText("Open Dialog")).toBeInTheDocument();
  });

  it("opens dialog content when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <p>Dialog body content</p>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText("Open Dialog"));
    await waitFor(() => {
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });
    expect(screen.getByText("Dialog body content")).toBeInTheDocument();
  });

  it("closes dialog when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Closable Dialog</DialogTitle>
          </DialogHeader>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await waitFor(() => {
      expect(screen.getByText("Closable Dialog")).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByText("Close");
    await user.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Closable Dialog")).not.toBeInTheDocument();
    });
  });

  it("renders with defaultOpen prop", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Default Open</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText("Default Open")).toBeInTheDocument();
  });

  it("renders close button with sr-only text", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>With Close</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });
});
