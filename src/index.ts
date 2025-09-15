import type { Result } from '@core/errors/Errors';
import type { ProductSummary } from '@core/entities/Product';
import type { StoreSummary } from '@core/entities/Store';
import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import { createRepository, type ClientDeps } from '@config/container';
export type { SuperstoreConfig } from '@features/catalog/datasources/SuperstoreApiDatasource';

export type Client = {
  searchProducts(
    query: string,
    storeId: string,
    page: number,
    pageSize: number
  ): Promise<Result<{ items: ProductSummary[]; page: number; pageSize: number; total: number | null }>>;
  listStores(): Promise<Result<{ items: StoreSummary[] }>>;
  getProductDetails(
    productId: string,
    storeId: string
  ): Promise<
    Result<{
      id: string;
      name: string;
      brand: string | null;
      description: string | null;
      imageUrl: string | null;
      packageSize: string | null;
      uom: string | null;
      pricing: {
        current: number;
        regular?: number | null;
        currency: 'CAD';
        unitPrice?: { value: number; unit: string; perQuantity: number } | null;
      };
      nutrition: unknown | null;
      breadcrumbs: Array<{ code: string; name: string }>;
      variants?: Array<{ id: string; name?: string }> | null;
    }>
  >;
};

export const createClient = (deps: ClientDeps = {}): Client => {
  const repo: SupermarketRepository = createRepository(deps);
  return {
    searchProducts: (query, storeId, page, pageSize) => repo.searchProducts(query, storeId, page, pageSize),
    listStores: () => repo.listStores(),
    getProductDetails: (productId, storeId) => repo.getProductDetails(productId, storeId)
  };
};

const getDefaultClient = (): Client => createClient();

export async function searchProducts(
  query: string,
  storeId: string,
  page: number,
  pageSize: number
): Promise<Result<{ items: ProductSummary[]; page: number; pageSize: number; total: number | null }>> {
  return getDefaultClient().searchProducts(query, storeId, page, pageSize);
}

export async function listStores(): Promise<Result<{ items: StoreSummary[] }>> {
  return getDefaultClient().listStores();
}

export async function getProductDetails(
  productId: string,
  storeId: string
): Promise<
  Result<{
    id: string;
    name: string;
    brand: string | null;
    description: string | null;
    imageUrl: string | null;
    packageSize: string | null;
    uom: string | null;
    pricing: {
      current: number;
      regular?: number | null;
      currency: 'CAD';
      unitPrice?: { value: number; unit: string; perQuantity: number } | null;
    };
    nutrition: unknown | null;
    breadcrumbs: Array<{ code: string; name: string }>;
    variants?: Array<{ id: string; name?: string }> | null;
  }>
> {
  return getDefaultClient().getProductDetails(productId, storeId);
}

export { createRepository };
export type { ClientDeps };
