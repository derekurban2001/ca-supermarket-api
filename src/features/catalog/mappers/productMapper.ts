import type { ProductDTO } from '../dtos/ProductDTO';
import type { ProductDetail, ProductSummary } from '@core/entities/Product';

export const toProductSummary = (dto: ProductDTO): ProductSummary => ({
  id: dto.code,
  name: dto.name,
  brand: dto.brand ?? null,
  imageUrl: dto.image ?? null,
  packageSize: dto.packageSize ?? null,
  price: { current: dto.pricing?.current ?? 0, regular: dto.pricing?.regular ?? null, currency: 'CAD' }
});

export const toProductDetail = (dto: ProductDTO): ProductDetail => ({
  id: dto.code,
  name: dto.name,
  brand: dto.brand ?? null,
  description: dto.description ?? null,
  imageUrl: dto.image ?? null,
  packageSize: dto.packageSize ?? null,
  uom: dto.uom ?? null,
  pricing: {
    current: dto.pricing?.current ?? 0,
    regular: dto.pricing?.regular ?? null,
    currency: 'CAD',
    unitPrice: dto.pricing?.unitPrice ?? null
  },
  nutrition: dto.nutrition ?? null,
  breadcrumbs: dto.breadcrumbs ?? [],
  variants: dto.variants?.map(v => ({ id: v.code, name: v.name })) ?? null
});

