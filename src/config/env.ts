import type { SuperstoreConfig } from '@features/catalog/datasources/SuperstoreApiDatasource';

/**
 * Environment-backed configuration for the client.
 */
export type ClientConfig = {
  /** Configuration for the Superstore datasource. */
  superstore: SuperstoreConfig;
};

/**
 * Parse a number from an environment variable value.
 * Returns undefined when the value is not a finite number.
 * @param value Environment value to parse (string/number-like).
 * @returns Parsed finite number or undefined when not a valid number.
 */
const parseNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const n = Number(String(value));
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Load configuration from environment variables.
 *
 * Supported variables:
 * - `SUPERSTORE_API_KEY`   (string, required at runtime for live calls)
 * - `SUPERSTORE_BASE_URL`  (string, defaults to upstream public base URL)
 * - `SUPERSTORE_BANNER`    (string, only 'superstore' is accepted; defaults to 'superstore')
 * - `SUPERSTORE_TIMEOUT_MS`(number, request timeout; defaults to 10000)
 *
 * Note: This function does not throw on missing API key. Enforcement occurs
 * in the container/datasource so unit tests can run without credentials.
 * @param env Process environment (defaults to process.env).
 * @returns Parsed typed configuration object for the client.
 */
export const loadEnvConfig = (env: NodeJS.ProcessEnv = process.env): ClientConfig => {
  const banner = (env.SUPERSTORE_BANNER?.toLowerCase() as 'superstore' | undefined) ?? 'superstore';
  const cfg: ClientConfig = {
    superstore: {
      apiKey: env.SUPERSTORE_API_KEY,
      baseUrl: env.SUPERSTORE_BASE_URL,
      banner,
      timeoutMs: parseNumber(env.SUPERSTORE_TIMEOUT_MS)
    }
  };
  return cfg;
};

/**
 * Convenience accessor returning only the Superstore config block.
 * @param env Process environment (defaults to process.env).
 * @returns SuperstoreConfig section from the loaded config.
 */
export const loadSuperstoreConfig = (env: NodeJS.ProcessEnv = process.env): SuperstoreConfig =>
  loadEnvConfig(env).superstore;
