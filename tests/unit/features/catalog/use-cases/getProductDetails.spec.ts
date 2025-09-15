import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import { getProductDetailsUseCase } from '@features/catalog/use-cases/getProductDetails';

describe('Use-case: getProductDetails', () => {
  it('delegates to repository with provided ids', async () => {
    const expected = {
      ok: true,
      value: { id: 'SKU', name: 'Test', brand: null, description: null, imageUrl: null, packageSize: null, uom: null, pricing: { current: 1, regular: null, currency: 'CAD' }, nutrition: null, breadcrumbs: [], variants: null }
    } as const;
    const repo = {
      getProductDetails: jest.fn(async () => expected),
      listStores: jest.fn(),
      searchProducts: jest.fn()
    } as unknown as SupermarketRepository;

    const execute = getProductDetailsUseCase(repo);
    const response = await execute('SKU', '1234');

    expect(repo.getProductDetails).toHaveBeenCalledWith('SKU', '1234');
    expect(response).toBe(expected);
  });
});
