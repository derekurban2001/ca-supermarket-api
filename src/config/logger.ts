/**
 * Supported log levels for the simple console logger.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Minimal console-backed logger with header redaction support.
 */
export class Logger {
  /**
   * @param level Minimum level to emit before logging.
   */
  constructor(private readonly level: LogLevel = 'info') {}

  private sanitize(meta: unknown): unknown {
    if (meta === null || typeof meta !== 'object') return meta;
    if (Array.isArray(meta)) return meta.map(entry => this.sanitize(entry));
    const clone: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
      clone[key] = key.toLowerCase() === 'headers' ? '[redacted]' : this.sanitize(value);
    }
    return clone;
  }

  /**
   * Emit a debug log when the logger is configured for debug output.
   * @param message Log message to emit.
   * @param meta Optional metadata payload.
   */
  debug(message: string, meta?: unknown): void {
    if (this.level === 'debug') console.debug(message, this.sanitize(meta));
  }

  /**
   * Emit an informational log when the level allows it.
   * @param message Log message to emit.
   * @param meta Optional metadata payload.
   */
  info(message: string, meta?: unknown): void {
    if (this.level === 'debug' || this.level === 'info') {
      console.info(message, this.sanitize(meta));
    }
  }

  /**
   * Emit a warning log.
   * @param message Log message to emit.
   * @param meta Optional metadata payload.
   */
  warn(message: string, meta?: unknown): void {
    console.warn(message, this.sanitize(meta));
  }

  /**
   * Emit an error log.
   * @param message Log message to emit.
   * @param meta Optional metadata payload.
   */
  error(message: string, meta?: unknown): void {
    console.error(message, this.sanitize(meta));
  }
}
