import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import type { Result } from '@core/errors/Errors';
import type { ProductDetail, ProductSummary } from '@core/entities/Product';
import type { StoreSummary } from '@core/entities/Store';
import { SuperstoreApiDatasource, SuperstoreAuthError } from '../datasources/SuperstoreApiDatasource';
import { toProductDetail, toProductSummary } from '../mappers/productMapper';
import { toStoreSummary } from '../mappers/storeMapper';

/**
 * Superstore-specific repository implementing the supermarket port.
 */
export class SuperstoreRepository implements SupermarketRepository {
  /**
   * @param ds Datasource used to reach the upstream Superstore API.
   */
  constructor(private readonly ds: SuperstoreApiDatasource) {}

  /**
   * Retrieve the list of stores provided by the datasource.
   * @returns Result containing store summaries or an authorization error.
   */
  async listStores(): Promise<Result<{ items: StoreSummary[] }>> {
    try {
      const stores = await this.ds.listStores();
      return { ok: true, value: { items: stores.map(toStoreSummary) } };
    } catch (err) {
      if (err instanceof SuperstoreAuthError) {
        return {
          ok: false,
          error: { type: 'unauthorized', message: err.message }
        } as const;
      }
      throw err;
    }
  }

  /**
   * Search Superstore products with validation and error mapping.
   * @param query Search term or identifier.
   * @param storeId Store scope for the search.
   * @param page Page number (1-based).
   * @param pageSize Page size.
   * @returns Result containing product summaries or an error.
   */
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
    try {
      const tiles = await this.ds.searchProducts({ term: query, storeId, page, pageSize });
      return {
        ok: true,
        value: { items: tiles.map(toProductSummary), page, pageSize, total: tiles.length }
      } as const;
    } catch (err) {
      if (err instanceof SuperstoreAuthError) {
        return {
          ok: false,
          error: { type: 'unauthorized', message: err.message }
        } as const;
      }
      throw err;
    }
  }

  /**
   * Fetch detailed product information scoped to a store.
   * @param productId Identifier of the product.
   * @param storeId Store identifier.
   * @returns Result containing a product detail or typed error.
   */
  async getProductDetails(productId: string, storeId: string): Promise<Result<ProductDetail>> {
    if (!storeId) return { ok: false, error: { type: 'invalid-params', message: 'storeId is required' } } as const;
    if (!productId) return { ok: false, error: { type: 'invalid-params', message: 'productId is required' } } as const;
    try {
      const dto = await this.ds.getProductDetails(productId, storeId);
      if (!dto) return { ok: false, error: { type: 'not-found', message: 'Product not found at store' } } as const;
      return { ok: true, value: toProductDetail(dto) } as const;
    } catch (err) {
      if (err instanceof SuperstoreAuthError) {
        return {
          ok: false,
          error: { type: 'unauthorized', message: err.message }
        } as const;
      }
      throw err;
    }
  }
}





