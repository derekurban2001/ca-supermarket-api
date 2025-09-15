import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import type { Result } from '@core/errors/Errors';
import type { ProductDetail } from '@core/entities/Product';

export const getProductDetailsUseCase = (repo: SupermarketRepository) => async (
  productId: string,
  storeId: string
): Promise<Result<ProductDetail>> => {
  return repo.getProductDetails(productId, storeId);
};

