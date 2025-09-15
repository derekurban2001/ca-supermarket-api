import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import { searchProductsUseCase } from '@features/catalog/use-cases/searchProducts';

describe('Use-case: searchProducts', () => {
  it('passes parameters to repository and returns its result', async () => {
    const expected = {
      ok: true,
      value: { items: [], page: 1, pageSize: 10, total: 0 }
    } as const;
    const repo = {
      searchProducts: jest.fn(async () => expected),
      listStores: jest.fn(),
      getProductDetails: jest.fn()
    } as unknown as SupermarketRepository;

    const execute = searchProductsUseCase(repo);
    const response = await execute('milk', '1234', 2, 5);

    expect(repo.searchProducts).toHaveBeenCalledWith('milk', '1234', 2, 5);
    expect(response).toBe(expected);
  });
});
