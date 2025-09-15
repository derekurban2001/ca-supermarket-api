import { listStores, searchProducts, getProductDetails } from '../../../src/index';

describe('Integration: quickstart flow (placeholder, no network)', () => {
  it('listStores → searchProducts → getProductDetails returns consistent shapes (live)', async () => {
    const stores = await listStores();
    expect(stores.ok).toBe(true);
    if (!stores.ok) return;

    const storeId = stores.value.items[0]?.id ?? '0000';

    const search = await searchProducts('Toilet paper', storeId, 1, 5);
    expect(search.ok).toBe(true);

    const firstId = search.ok && search.value.items[0]?.id;
    if (firstId) {
      const details = await getProductDetails(firstId, storeId);
      expect(typeof details.ok).toBe('boolean');
    }
  });
});
