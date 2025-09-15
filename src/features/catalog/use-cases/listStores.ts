import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import type { Result } from '@core/errors/Errors';
import type { StoreSummary } from '@core/entities/Store';

export const listStoresUseCase = (repo: SupermarketRepository) => async (): Promise<Result<{ items: StoreSummary[] }>> => {
  return repo.listStores();
};

