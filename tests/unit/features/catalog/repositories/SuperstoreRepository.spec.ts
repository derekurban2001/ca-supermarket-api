import { SuperstoreRepository } from '@features/catalog/repositories/SuperstoreRepository';
import { SuperstoreApiDatasource, SuperstoreAuthError } from '@features/catalog/datasources/SuperstoreApiDatasource';

describe('SuperstoreRepository', () => {
  const build = (overrides: Partial<SuperstoreApiDatasource>) => {
    const defaults: Partial<SuperstoreApiDatasource> = {
      listStores: jest.fn(),
      searchProducts: jest.fn(),
      getProductDetails: jest.fn()
    };
    return new SuperstoreRepository({ ...defaults, ...overrides } as SuperstoreApiDatasource);
  };

  it('maps SuperstoreAuthError.missing to unauthorized error result', async () => {
    const repo = build({ listStores: jest.fn().mockRejectedValue(SuperstoreAuthError.missing()) });

    const result = await repo.listStores();

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ type: 'unauthorized' })
    });
  });

  it('maps SuperstoreAuthError.invalid to unauthorized error result for search', async () => {
    const repo = build({
      searchProducts: jest.fn().mockRejectedValue(SuperstoreAuthError.invalid(403))
    });

    const result = await repo.searchProducts('milk', '1234', 1, 10);

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ type: 'unauthorized' })
    });
  });
});
