import type { Result } from '@core/errors/Errors';
import type { ProductDetail, ProductSummary } from '@core/entities/Product';
import type { StoreSummary } from '@core/entities/Store';

export interface SupermarketRepository {
  searchProducts(
    query: string,
    storeId: string,
    page: number,
    pageSize: number
  ): Promise<Result<{ items: ProductSummary[]; page: number; pageSize: number; total: number | null }>>;

  listStores(): Promise<Result<{ items: StoreSummary[] }>>;

  getProductDetails(productId: string, storeId: string): Promise<Result<ProductDetail>>;
}

