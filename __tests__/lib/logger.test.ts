import { logger } from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info messages with CSS styling", () => {
    logger.info("test info");
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining("[INFO]"),
      expect.stringContaining("color: #2563eb"),
    );
  });

  it("logs warn messages with CSS styling", () => {
    logger.warn("test warn");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("[WARN]"),
      expect.stringContaining("color: #d97706"),
    );
  });

  it("logs error messages with CSS styling", () => {
    logger.error("test error");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[ERROR]"),
      expect.stringContaining("color: #dc2626"),
    );
  });

  it("includes timestamp in log output", () => {
    logger.info("timed");
    expect(console.info).toHaveBeenCalledWith(expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T/), expect.any(String));
  });

  it("appends extra args as JSON", () => {
    logger.info("with data", { key: "value" }, 42);
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('{"key":"value"}'), expect.any(String));
  });

  it("handles empty args gracefully", () => {
    logger.info("just a message");
    expect(console.info).toHaveBeenCalledWith(expect.not.stringContaining("{}"), expect.any(String));
  });
});
