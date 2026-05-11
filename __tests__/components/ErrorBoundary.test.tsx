import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "@/components/ErrorBoundary";

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("renders default error UI when a child throws", () => {
    const ThrowComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("An unexpected error occurred. Please try refreshing the page.")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const ThrowComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary fallback={<div>Custom error fallback</div>}>
        <ThrowComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom error fallback")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("recovers when Try Again is clicked", async () => {
    const user = userEvent.setup();

    let shouldThrow = true;
    const ConditionalComponent = () => {
      if (shouldThrow) {
        throw new Error("Conditional error");
      }
      return <div>Recovered content</div>;
    };

    const { rerender } = render(
      <ErrorBoundary key="eb-1">
        <ConditionalComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByText("Try again"));

    rerender(
      <ErrorBoundary key="eb-1">
        <ConditionalComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Recovered content")).toBeInTheDocument();
  });

  it("shows error icon and try again button on error", () => {
    const ThrowComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
