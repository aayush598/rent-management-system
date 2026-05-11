import { describe, it, expect, afterEach } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  const originalEnv = process.env.NEXT_PUBLIC_LOG_LEVEL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_LOG_LEVEL = originalEnv;
  });

  it("has debug, info, warn, error methods", () => {
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("does not throw when logging", () => {
    expect(() => logger.info("test message")).not.toThrow();
    expect(() => logger.debug("debug test")).not.toThrow();
    expect(() => logger.warn("warning test")).not.toThrow();
    expect(() => logger.error("error test")).not.toThrow();
  });

  it("handles multiple arguments", () => {
    expect(() => logger.info("test", { key: "value" }, [1, 2, 3])).not.toThrow();
  });
});
