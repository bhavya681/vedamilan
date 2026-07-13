type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

type LoggerLike = {
  fatal: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => LoggerLike;
};

function createBrowserLogger(name?: string): LoggerLike {
  const prefix = name ? `[${name}]` : "[app]";

  const write =
    (method: "error" | "warn" | "info" | "debug" | "log") =>
    (...args: unknown[]) => {
      console[method](prefix, ...args);
    };

  const base: LoggerLike = {
    fatal: write("error"),
    error: write("error"),
    warn: write("warn"),
    info: write("info"),
    debug: write("debug"),
    trace: write("log"),
    child: (bindings) => createBrowserLogger(String(bindings["name"] ?? name ?? "app")),
  };

  return base;
}

function createServerLogger(name?: string): LoggerLike {
  // Lazy require keeps this module importable in edge/browser bundles when tree-shaken carefully.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pino = require("pino") as typeof import("pino");
  const level = (process.env.LOG_LEVEL as LogLevel | undefined) ?? "info";
  const isDev = process.env.NODE_ENV !== "production";

  const instance = pino({
    name: name ?? "jyotisangam",
    level,
    ...(isDev
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          },
        }
      : {}),
  });

  return instance as unknown as LoggerLike;
}

export function createLogger(name?: string): LoggerLike {
  if (typeof window !== "undefined") {
    return createBrowserLogger(name);
  }

  return createServerLogger(name);
}

export const logger = createLogger("jyotisangam");
