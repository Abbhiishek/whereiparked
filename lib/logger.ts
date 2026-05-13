type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const minLevel: LogLevel = __DEV__ ? 'debug' : 'warn';

function emit(level: LogLevel, scope: string, message: string, data?: unknown): void {
  if (levelOrder[level] < levelOrder[minLevel]) return;
  const tag = `[${level.toUpperCase()}][${scope}]`;
  if (data !== undefined) {
    // Per testing/dev needs only — production builds gate this above.
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](tag, message, data);
  } else {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](tag, message);
  }
}

export function createLogger(scope: string) {
  return {
    debug: (message: string, data?: unknown) => emit('debug', scope, message, data),
    info: (message: string, data?: unknown) => emit('info', scope, message, data),
    warn: (message: string, data?: unknown) => emit('warn', scope, message, data),
    error: (message: string, data?: unknown) => emit('error', scope, message, data),
  };
}
