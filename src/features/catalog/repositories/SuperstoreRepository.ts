import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import type { Result } from '@core/errors/Errors';
import type { ProductDetail, ProductSummary } from '@core/entities/Product';
import type { StoreSummary } from '@core/entities/Store';
import { SuperstoreApiDatasource } from '../datasources/SuperstoreApiDatasource';
import { toProductDetail, toProductSummary } from '../mappers/productMapper';
import { toStoreSummary } from '../mappers/storeMapper';

export class SuperstoreRepository implements SupermarketRepository {
  constructor(private readonly ds: SuperstoreApiDatasource) {}

  async listStores(): Promise<Result<{ items: StoreSummary[] }>> {
    const stores = await this.ds.listStores();
    return { ok: true, value: { items: stores.map(toStoreSummary) } };
  }

  async searchProducts(
    query: string,
    storeId: string,
    page: number,
    pageSize: number
  ): Promise<Result<{ items: ProductSummary[]; page: number; pageSize: number; total: number | null }>> {
    if (!storeId) return { ok: false, error: { type: 'invalid-params', message: 'storeId is required' } } as const;
    if (!query) return { ok: false, error: { type: 'invalid-params', message: 'query is required' } } as const;
    if (!Number.isInteger(page) || !Number.isInteger(pageSize) || page < 1 || pageSize < 1) {
      return { ok: false, error: { type: 'invalid-params', message: 'page and pageSize must be positive integers' } } as const;
    }
    const tiles = await this.ds.searchProducts({ term: query, storeId, page, pageSize });
    return { ok: true, value: { items: tiles.map(toProductSummary), page, pageSize, total: tiles.length } };
  }

  async getProductDetails(productId: string, storeId: string): Promise<Result<ProductDetail>> {
    if (!storeId) return { ok: false, error: { type: 'invalid-params', message: 'storeId is required' } } as const;
    if (!productId) return { ok: false, error: { type: 'invalid-params', message: 'productId is required' } } as const;
    const dto = await this.ds.getProductDetails(productId, storeId);
    if (!dto) return { ok: false, error: { type: 'not-found', message: 'Product not found at store' } } as const;
    return { ok: true, value: toProductDetail(dto) };
  }
}

