import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import { SuperstoreApiDatasource, type SuperstoreConfig } from '@features/catalog/datasources/SuperstoreApiDatasource';
import { SuperstoreRepository } from '@features/catalog/repositories/SuperstoreRepository';

export type ClientDeps = {
  repository?: SupermarketRepository;
  superstore?: SuperstoreConfig;
};

/**
 * Construct a `SupermarketRepository` using either an injected implementation or
 * a real Superstore-backed datasource configured from provided overrides and/or
 * environment variables.
 *
 * Env support:
 * - `SUPERSTORE_API_KEY` (required for live calls)
 * - `SUPERSTORE_BASE_URL` (optional)
 * - `SUPERSTORE_TIMEOUT_MS` (optional)
 */
export const createRepository = (deps: ClientDeps = {}): SupermarketRepository => {
  if (deps.repository) return deps.repository;
  const cfg: SuperstoreConfig = {
    apiKey: deps.superstore?.apiKey ?? process.env.SUPERSTORE_API_KEY,
    baseUrl: deps.superstore?.baseUrl ?? process.env.SUPERSTORE_BASE_URL,
    banner: deps.superstore?.banner ?? 'superstore',
    timeoutMs: deps.superstore?.timeoutMs ?? (process.env.SUPERSTORE_TIMEOUT_MS ? Number(process.env.SUPERSTORE_TIMEOUT_MS) : undefined)
  };
  const ds = new SuperstoreApiDatasource(cfg);
  return new SuperstoreRepository(ds);
};
