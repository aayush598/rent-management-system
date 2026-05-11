type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || "info";

const isServer = typeof window === "undefined";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return `${prefix} ${message} ${args.length ? JSON.stringify(args, null, 0) : ""}`;
}

export const logger = {
  debug(message: string, ...args: unknown[]) {
    if (!shouldLog("debug")) return;
    const formatted = formatMessage("debug", message, ...args);
    if (isServer) {
      console.debug(formatted);
    } else {
      console.debug(`%c${formatted}`, "color: #6b7280; font-size: 11px;");
    }
  },

  info(message: string, ...args: unknown[]) {
    if (!shouldLog("info")) return;
    const formatted = formatMessage("info", message, ...args);
    if (isServer) {
      console.info(formatted);
    } else {
      console.info(`%c${formatted}`, "color: #2563eb; font-size: 11px;");
    }
  },

  warn(message: string, ...args: unknown[]) {
    if (!shouldLog("warn")) return;
    const formatted = formatMessage("warn", message, ...args);
    if (isServer) {
      console.warn(formatted);
    } else {
      console.warn(`%c${formatted}`, "color: #d97706; font-size: 11px;");
    }
  },

  error(message: string, ...args: unknown[]) {
    if (!shouldLog("error")) return;
    const formatted = formatMessage("error", message, ...args);
    if (isServer) {
      console.error(formatted);
    } else {
      console.error(`%c${formatted}`, "color: #dc2626; font-size: 11px; font-weight: bold;");
    }
  },
};
