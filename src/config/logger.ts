/* Simple logger placeholder with redaction */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  constructor(private level: LogLevel = 'info') {}
  private redactHeaders(obj: unknown): unknown {
    try {
      const clone = JSON.parse(JSON.stringify(obj));
      if (clone && typeof clone === 'object' && 'headers' in (clone as any)) {
        (clone as any).headers = '[redacted]';
      }
      return clone;
    } catch {
      return obj;
    }
  }
  debug(msg: string, meta?: unknown) {
    if (this.level === 'debug') console.debug(msg, this.redactHeaders(meta));
  }
  info(msg: string, meta?: unknown) {
    if (['debug', 'info'].includes(this.level)) console.info(msg, this.redactHeaders(meta));
  }
  warn(msg: string, meta?: unknown) {
    console.warn(msg, this.redactHeaders(meta));
  }
  error(msg: string, meta?: unknown) {
    console.error(msg, this.redactHeaders(meta));
  }
}

