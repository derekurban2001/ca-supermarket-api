export type ErrorType =
  | 'invalid-params'
  | 'not-found'
  | 'rate-limited'
  | 'upstream-change'
  | 'unauthorized'
  | 'unknown';

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { type: ErrorType; code?: string; retryable?: boolean; message: string } };

