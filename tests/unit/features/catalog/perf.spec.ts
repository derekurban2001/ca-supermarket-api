import type { SupermarketRepository } from '@core/ports/SupermarketRepository';
import { searchProductsUseCase } from '@features/catalog/use-cases/searchProducts';
import { Logger } from '@config/logger';

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

describe('Performance: search path smoke', () => {
  it('logs timing for a fast search path using a stub repository', async () => {
    const logger = new Logger('debug');

    const repo: SupermarketRepository = {
      async searchProducts() {
        await sleep(25);
        return { ok: true as const, value: { items: [], page: 1, pageSize: 10, total: 0 } };
      },
      async listStores() {
        return { ok: true as const, value: { items: [] } };
      },
      async getProductDetails() {
        return {
          ok: true as const,
          value: {
            id: 'SKU',
            name: 'Name',
            brand: null,
            description: null,
            imageUrl: null,
            packageSize: null,
            uom: null,
            pricing: { current: 0, regular: null, currency: 'CAD' },
            nutrition: null,
            breadcrumbs: [],
            variants: null
          }
        };
      }
    };

    const start = performance.now();
    const execute = searchProductsUseCase(repo);
    const res = await execute('milk', '1234', 1, 10);
    const duration = performance.now() - start;
    logger.info('searchProducts duration (ms)', { duration: Math.round(duration) });

    expect(res.ok).toBe(true);
    // Should comfortably finish under 200ms on a stubbed path
    expect(duration).toBeLessThan(200);
  });
});
