import { getProductDetails, listStores, searchProducts } from '../../../src/index';

describe('Integration: quickstart flow (live API)', () => {
  it('listStores → searchProducts → getProductDetails returns consistent shapes', async () => {
    const stores = await listStores();
    expect(stores.ok).toBe(true);
    if (!stores.ok || stores.value.items.length === 0) return;

    const storeId = stores.value.items[0].id;
    const search = await searchProducts('Toilet paper', storeId, 1, 5);

    expect(search.ok).toBe(true);
    if (!search.ok || search.value.items.length === 0) return;

    const firstId = search.value.items[0]?.id;
    if (!firstId) return;

    const details = await getProductDetails(firstId, storeId);
    expect(details.ok).toBe(true);
    if (!details.ok) return;

    expect(details.value.pricing.currency).toBe('CAD');
  });
});
