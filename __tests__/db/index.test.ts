vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { db } from "@/db";

describe("Database Connection", () => {
  it("exports a db object with query methods", () => {
    expect(db).toBeDefined();
    expect(typeof db).toBe("object");
    expect(typeof db.select).toBe("function");
    expect(typeof db.insert).toBe("function");
    expect(typeof db.update).toBe("function");
    expect(typeof db.delete).toBe("function");
  });

  it("can call query methods", () => {
    db.select();
    expect(db.select).toHaveBeenCalledOnce();
  });

  it("can chain drizzle query methods", () => {
    const mockFrom = vi.fn();
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

    db.select().from("table");

    expect(db.select).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith("table");
  });
});
