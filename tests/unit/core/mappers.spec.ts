import { toProductDetail } from '@features/catalog/mappers/productMapper';
import type { ProductDTO } from '@features/catalog/dtos/ProductDTO';
import { loadEnvConfig } from '@config/env';

describe('Core: mappers and validators', () => {
  it('product nutrition mapping accepts common synonym fields', () => {
    const dto: ProductDTO = {
      code: 'SKU1',
      name: 'Sample',
      nutrition: {
        // synonyms exercised here
        servingSize: '2 slices',
        energy: '120',
        fats: '4g',
        carbohydrates: '16g',
        microNutrients: { iron: '10%' },
        macroBreakdown: { fiber: '2g' } as unknown as Record<string, unknown>
      } as unknown as ProductDTO['nutrition']
    };

    const mapped = toProductDetail(dto);
    expect(mapped.nutrition).toEqual({
      serving: '2 slices',
      calories: '120',
      macros: expect.objectContaining({
        fat: '4g',
        carbs: '16g',
        sub: expect.objectContaining({ fiber: '2g' })
      }),
      micros: expect.objectContaining({ iron: '10%' }),
      sodium: null,
      cholesterol: null,
      disclaimer: null,
      ingredients: null
    });
  });

  it('env validator parses banner, base URL and timeout ms', () => {
    const env = {
      SUPERSTORE_API_KEY: 'test-key',
      SUPERSTORE_BASE_URL: 'https://example.test/base',
      SUPERSTORE_BANNER: 'superstore',
      SUPERSTORE_TIMEOUT_MS: '2500'
    } as unknown as NodeJS.ProcessEnv;

    const cfg = loadEnvConfig(env);
    expect(cfg.superstore).toEqual(
      expect.objectContaining({
        apiKey: 'test-key',
        baseUrl: 'https://example.test/base',
        banner: 'superstore',
        timeoutMs: 2500
      })
    );
  });
});

