import type { Result } from '@core/errors/Errors';
import type { ProductSummary } from '@core/entities/Product';
import type { StoreSummary } from '@core/entities/Store';
import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import { createRepository } from '@config/container';
export type { SuperstoreConfig } from '@features/catalog/datasources/SuperstoreApiDatasource';

export async function searchProducts(
  query: string,
  storeId: string,
  page: number,
  pageSize: number
): Promise<Result<{ items: ProductSummary[]; page: number; pageSize: number; total: number | null }>> {
  const repo: SupermarketRepository = createRepository();
  return repo.searchProducts(query, storeId, page, pageSize);
}

export async function listStores(): Promise<Result<{ items: StoreSummary[] }>> {
  const repo: SupermarketRepository = createRepository();
  return repo.listStores();
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
    pricing: { current: number; regular?: number | null; currency: 'CAD'; unitPrice?: { value: number; unit: string; perQuantity: number } | null };
    nutrition: unknown | null;
    breadcrumbs: Array<{ code: string; name: string }>;
    variants?: Array<{ id: string; name?: string }> | null;
  }>
> {
  const repo: SupermarketRepository = createRepository();
  return repo.getProductDetails(productId, storeId);
}

export { createRepository };
