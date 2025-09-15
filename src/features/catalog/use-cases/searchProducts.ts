import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import type { Result } from '@core/errors/Errors';
import type { ProductSummary } from '@core/entities/Product';

export const searchProductsUseCase = (
  repo: SupermarketRepository
) => async (
  query: string,
  storeId: string,
  page: number,
  pageSize: number
): Promise<Result<{ items: ProductSummary[]; page: number; pageSize: number; total: number | null }>> => {
  return repo.searchProducts(query, storeId, page, pageSize);
};

