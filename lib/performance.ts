import { logger } from "./logger";

const marks = new Map<string, number>();

export const perf = {
  start(label: string) {
    if (typeof performance === "undefined") return;
    marks.set(label, performance.now());
  },

  end(label: string) {
    if (typeof performance === "undefined") return;
    const start = marks.get(label);
    if (!start) {
      logger.warn(`No start mark found for: ${label}`);
      return;
    }
    const duration = performance.now() - start;
    marks.delete(label);

    if (duration > 16) {
      logger.warn(`[PERF] ${label} took ${duration.toFixed(2)}ms (exceeds 16ms frame budget)`);
    } else {
      logger.debug(`[PERF] ${label} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  },

  measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    perf.start(label);
    return fn().finally(() => perf.end(label));
  },

  measureSync<T>(label: string, fn: () => T): T {
    perf.start(label);
    try {
      return fn();
    } finally {
      perf.end(label);
    }
  },
};

export function reportWebVitals() {
  if (typeof window === "undefined" || !("performance" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "largest-contentful-paint") {
          logger.info(`[WebVital] LCP: ${entry.startTime.toFixed(2)}ms`);
        }
        if (entry.entryType === "first-input") {
          const fidEntry = entry as PerformanceEventTiming;
          logger.info(`[WebVital] FID: ${fidEntry.processingStart - fidEntry.startTime}ms`);
        }
        if (entry.entryType === "layout-shift") {
          const shift = entry as unknown as { value: number };
          logger.info(`[WebVital] CLS: ${shift.value}`);
        }
      }
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });
    observer.observe({ type: "first-input", buffered: true });
    observer.observe({ type: "layout-shift", buffered: true });
  } catch {
    // PerformanceObserver not supported
  }
}
