import { toProductDetail, toProductSummary } from '@features/catalog/mappers/productMapper';
import type { ProductDTO } from '@features/catalog/dtos/ProductDTO';

describe('productMapper', () => {
  const baseDto: ProductDTO = {
    code: '21053436_EA',
    name: 'Paper Towels',
    brand: 'PC',
    description: '6 rolls of paper towels',
    image: 'https://example.com/paper.jpg',
    packageSize: '6 rolls',
    uom: 'EA',
    pricing: {
      current: 1299,
      regular: 1499,
      unitPrice: { value: 216, unit: '100 sheets', perQuantity: 1 }
    },
    nutrition: { calories: '10' },
    breadcrumbs: [{ code: 'household', name: 'Household' }],
    variants: [{ code: 'ALT', name: 'Alternative' }]
  };

  it('maps dto to product summary with defaults', () => {
    const summary = toProductSummary(baseDto);

    expect(summary).toEqual({
      id: '21053436_EA',
      name: 'Paper Towels',
      brand: 'PC',
      imageUrl: 'https://example.com/paper.jpg',
      packageSize: '6 rolls',
      price: { current: 1299, regular: 1499, currency: 'CAD' }
    });
  });

  it('maps dto to detailed product shape preserving optional fields', () => {
    const detail = toProductDetail(baseDto);

    expect(detail).toEqual({
      id: '21053436_EA',
      name: 'Paper Towels',
      brand: 'PC',
      description: '6 rolls of paper towels',
      imageUrl: 'https://example.com/paper.jpg',
      packageSize: '6 rolls',
      uom: 'EA',
      pricing: {
        current: 1299,
        regular: 1499,
        currency: 'CAD',
        unitPrice: { value: 216, unit: '100 sheets', perQuantity: 1 }
      },
      nutrition: { calories: '10' },
      breadcrumbs: [{ code: 'household', name: 'Household' }],
      variants: [{ id: 'ALT', name: 'Alternative' }]
    });
  });

  it('falls back to nulls when dto omits optional data', () => {
    const detail = toProductDetail({
      code: 'SKU',
      name: 'Name'
    });

    expect(detail).toEqual({
      id: 'SKU',
      name: 'Name',
      brand: null,
      description: null,
      imageUrl: null,
      packageSize: null,
      uom: null,
      pricing: {
        current: 0,
        regular: null,
        currency: 'CAD',
        unitPrice: null
      },
      nutrition: null,
      breadcrumbs: [],
      variants: null
    });
  });
});
