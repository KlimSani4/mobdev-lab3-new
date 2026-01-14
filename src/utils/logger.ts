type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const logs: LogEntry[] = [];
const MAX_LOGS = 100;

function createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };
}

function addLog(entry: LogEntry): void {
  logs.push(entry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }
}

export const logger = {
  debug(message: string, data?: unknown): void {
    if (__DEV__) {
      console.debug(`[DEBUG] ${message}`, data ?? '');
      addLog(createLogEntry('debug', message, data));
    }
  },

  info(message: string, data?: unknown): void {
    if (__DEV__) {
      console.info(`[INFO] ${message}`, data ?? '');
    }
    addLog(createLogEntry('info', message, data));
  },

  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, data ?? '');
    addLog(createLogEntry('warn', message, data));
  },

  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error ?? '');
    addLog(createLogEntry('error', message, error));
  },

  getLogs(): LogEntry[] {
    return [...logs];
  },

  clearLogs(): void {
    logs.length = 0;
  },

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return logs.filter((log) => log.level === level);
  },
};
