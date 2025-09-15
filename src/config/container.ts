import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import { SuperstoreApiDatasource, type SuperstoreConfig } from '@features/catalog/datasources/SuperstoreApiDatasource';
import { SuperstoreRepository } from '@features/catalog/repositories/SuperstoreRepository';

export type ClientDeps = {
  repository?: SupermarketRepository;
  superstore?: SuperstoreConfig;
};

export const createRepository = (deps: ClientDeps = {}): SupermarketRepository => {
  if (deps.repository) return deps.repository;
  const cfg: SuperstoreConfig = {
    apiKey: deps.superstore?.apiKey ?? process.env.SUPERSTORE_API_KEY,
    baseUrl: deps.superstore?.baseUrl ?? process.env.SUPERSTORE_BASE_URL,
    banner: deps.superstore?.banner ?? 'superstore',
    timeoutMs: deps.superstore?.timeoutMs ?? (process.env.SUPERSTORE_TIMEOUT_MS ? Number(process.env.SUPERSTORE_TIMEOUT_MS) : undefined)
  };
  if (!cfg.apiKey || cfg.apiKey.trim().length === 0) {
    throw new Error(
      'SUPERSTORE_API_KEY is required to create a Superstore repository. Tests and runtime calls hit the live API.'
    );
  }
  const ds = new SuperstoreApiDatasource(cfg);
  return new SuperstoreRepository(ds);
};
