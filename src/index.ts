import type { Result } from '@core/errors/Errors';
import type { ProductDetail, ProductSummary } from '@core/entities/Product';
import type { StoreSummary } from '@core/entities/Store';
import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import { createRepository, type ClientDeps } from '@config/container';
export type { SuperstoreConfig } from '@features/catalog/datasources/SuperstoreApiDatasource';

/**
 * Public surface presented by the CanadianSupermarketApi client.
 */
export type Client = {
  searchProducts(
    query: string,
    storeId: string,
    page: number,
    pageSize: number
  ): Promise<Result<{ items: ProductSummary[]; page: number; pageSize: number; total: number | null }>>;
  listStores(): Promise<Result<{ items: StoreSummary[] }>>;
  getProductDetails(productId: string, storeId: string): Promise<Result<ProductDetail>>;
};

/**
 * Create a client instance using the provided dependency overrides.
 * @param deps Optional dependency overrides for repository or datasource configuration.
 * @returns A client that exposes supermarket search, listing, and detail operations.
 */
export const createClient = (deps: ClientDeps = {}): Client => {
  const repo: SupermarketRepository = createRepository(deps);
  return {
    searchProducts: (query, storeId, page, pageSize) => repo.searchProducts(query, storeId, page, pageSize),
    listStores: () => repo.listStores(),
    getProductDetails: (productId, storeId) => repo.getProductDetails(productId, storeId)
  };
};

const getDefaultClient = (): Client => createClient();

/**
 * Search products within a given store using keyword or known product identifiers.
 * @param query Keyword or identifier to search.
 * @param storeId Store context required by the upstream API.
 * @param page 1-based page number.
 * @param pageSize Number of results per page.
 * @returns A result containing paginated product summaries or a typed error.
 */
export async function searchProducts(
  query: string,
  storeId: string,
  page: number,
  pageSize: number
): Promise<Result<{ items: ProductSummary[]; page: number; pageSize: number; total: number | null }>> {
  return getDefaultClient().searchProducts(query, storeId, page, pageSize);
}

/**
 * List all available Real Canadian Superstore locations.
 * @returns A result containing store summaries or a typed error.
 */
export async function listStores(): Promise<Result<{ items: StoreSummary[] }>> {
  return getDefaultClient().listStores();
}

/**
 * Retrieve a detailed view of a product scoped to a specific store.
 * @param productId Chain-wide product identifier.
 * @param storeId Store identifier to scope availability.
 * @returns A result with full product detail information or a typed error.
 */
export async function getProductDetails(
  productId: string,
  storeId: string
): Promise<Result<ProductDetail>> {
  return getDefaultClient().getProductDetails(productId, storeId);
}

export { createRepository };
export type { ClientDeps };
