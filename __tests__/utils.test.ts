import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className utility)", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null values", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });

  it("merges tailwind classes correctly (later wins)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });
});
