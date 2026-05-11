import { perf } from "@/lib/performance";
import { logger } from "@/lib/logger";

vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("perf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    perf.start("test-label");
  });

  describe("start / end", () => {
    it("measures duration and logs debug for fast operations", () => {
      const duration = perf.end("test-label");
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining("[PERF] test-label took"));
    });

    it("logs warning when no start mark exists", () => {
      perf.end("nonexistent");
      expect(logger.warn).toHaveBeenCalledWith("No start mark found for: nonexistent");
    });

    it("handles performance being undefined gracefully", () => {
      const origPerformance = globalThis.performance;
      (globalThis as any).performance = undefined;
      expect(() => {
        perf.start("x");
        perf.end("x");
      }).not.toThrow();
      globalThis.performance = origPerformance;
    });
  });

  describe("measureSync", () => {
    it("measures a synchronous function and returns its value", () => {
      const result = perf.measureSync("sync-fn", () => 42);
      expect(result).toBe(42);
    });

    it("logs debug on completion", () => {
      perf.measureSync("sync-ok", () => "done");
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining("[PERF] sync-ok took"));
    });

    it("still ends the mark when fn throws", () => {
      expect(() =>
        perf.measureSync("sync-throw", () => {
          throw new Error("oops");
        }),
      ).toThrow("oops");
    });
  });

  describe("measureAsync", () => {
    it("measures an async function and returns its value", async () => {
      const result = await perf.measureAsync("async-fn", async () => "done");
      expect(result).toBe("done");
    });

    it("still ends the mark when the promise rejects", async () => {
      await expect(
        perf.measureAsync("async-reject", async () => {
          throw new Error("fail");
        }),
      ).rejects.toThrow("fail");
    });
  });
});
