import type { ProductDTO } from '../dtos/ProductDTO';
import type { ProductDetail, ProductSummary } from '@core/entities/Product';
import type { Nutrition } from '@core/entities/Nutrition';

const asString = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
};

const toRecord = (value: unknown): Record<string, string | null> => {
  if (!value || typeof value !== 'object') return {};
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string | null>>(
    (acc, [key, val]) => {
      acc[key] = asString(val);
      return acc;
    },
    {}
  );
};

const pick = (source: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    if (key in source) {
      const str = asString(source[key]);
      if (str !== null) return str;
    }
  }
  return null;
};

const toNutrition = (value: unknown): Nutrition | null => {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  return {
    serving: pick(raw, ['serving', 'servingSize']),
    calories: pick(raw, ['calories', 'energy']),
    macros: {
      fat: pick(raw, ['fat', 'fats', 'totalFat']),
      carbs: pick(raw, ['carbs', 'carbohydrates', 'totalCarbohydrates']),
      protein: pick(raw, ['protein']),
      sub: toRecord(raw.sub ?? raw.details ?? raw.macroBreakdown)
    },
    micros: toRecord(raw.micros ?? raw.microNutrients ?? raw.micronutrients),
    sodium: pick(raw, ['sodium']),
    cholesterol: pick(raw, ['cholesterol']),
    disclaimer: pick(raw, ['disclaimer', 'footnote', 'footNote']),
    ingredients: pick(raw, ['ingredients', 'ingredientList'])
  };
};

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
  nutrition: toNutrition(dto.nutrition),
  breadcrumbs: dto.breadcrumbs ?? [],
  variants: dto.variants?.map(variant => ({ id: variant.code, name: variant.name })) ?? null
});
