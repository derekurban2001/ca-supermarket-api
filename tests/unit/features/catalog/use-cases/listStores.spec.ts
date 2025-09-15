import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import { listStoresUseCase } from '@features/catalog/use-cases/listStores';

describe('Use-case: listStores', () => {
  it('delegates to repository', async () => {
    const result = { ok: true, value: { items: [] } } as const;
    const repo = {
      listStores: jest.fn(async () => result),
      searchProducts: jest.fn(),
      getProductDetails: jest.fn()
    } as unknown as SupermarketRepository;

    const execute = listStoresUseCase(repo);
    const response = await execute();

    expect(repo.listStores).toHaveBeenCalledTimes(1);
    expect(response).toBe(result);
  });
});
