import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

describe("Card", () => {
  it("renders Card component", () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText("Card content");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("rounded-2xl");
  });

  it("renders Card with additional className", () => {
    render(<Card className="custom-card">Custom</Card>);
    expect(screen.getByText("Custom")).toHaveClass("custom-card");
  });

  it("renders CardHeader", () => {
    render(<CardHeader>Header</CardHeader>);
    const header = screen.getByText("Header");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("flex-col");
  });

  it("renders CardTitle", () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText("Title");
    expect(title).toHaveClass("text-lg");
    expect(title).toHaveClass("font-bold");
  });

  it("renders CardContent", () => {
    render(<CardContent>Content</CardContent>);
    const content = screen.getByText("Content");
    expect(content).toHaveClass("p-6");
  });

  it("renders a composed card", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Composed Title</CardTitle>
        </CardHeader>
        <CardContent>Composed body</CardContent>
      </Card>,
    );
    expect(screen.getByText("Composed Title")).toBeInTheDocument();
    expect(screen.getByText("Composed body")).toBeInTheDocument();
  });
});
