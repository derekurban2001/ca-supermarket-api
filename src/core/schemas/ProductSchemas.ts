import { z } from 'zod';

// --- Common primitives
export const CurrencySchema = z.literal('CAD');

// Price summary used in ProductSummary
export const PriceSummarySchema = z
  .object({
    current: z.number().finite(),
    regular: z.number().finite().nullable(),
    currency: CurrencySchema
  })
  .passthrough();

// Full pricing used in ProductDetail
export const UnitPriceSchema = z
  .object({ value: z.number().finite(), unit: z.string(), perQuantity: z.number().finite() })
  .passthrough();

export const PromoSchema = z
  .object({ text: z.string().optional(), expiresAt: z.string().optional() })
  .passthrough();

export const PricingSchema = z
  .object({
    current: z.number().finite(),
    regular: z.number().finite().nullable(),
    currency: CurrencySchema,
    unitPrice: UnitPriceSchema.nullable().optional(),
    promo: PromoSchema.nullable().optional()
  })
  .passthrough();

// Nutrition
export const NutritionSchema = z
  .object({
    serving: z.string().nullable(),
    calories: z.string().nullable(),
    macros: z.object({
      fat: z.string().nullable(),
      carbs: z.string().nullable(),
      protein: z.string().nullable(),
      sub: z.record(z.string().nullable())
    }),
    micros: z.record(z.string().nullable()),
    sodium: z.string().nullable(),
    cholesterol: z.string().nullable(),
    disclaimer: z.string().nullable(),
    ingredients: z.string().nullable()
  })
  .passthrough();

// Domain entities
export const ProductSummarySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    brand: z.string().nullable(),
    imageUrl: z.string().nullable(),
    packageSize: z.string().nullable(),
    price: PriceSummarySchema
  })
  .passthrough();

export const ProductDetailSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    brand: z.string().nullable(),
    description: z.string().nullable(),
    imageUrl: z.string().nullable(),
    packageSize: z.string().nullable(),
    uom: z.string().nullable(),
    pricing: PricingSchema,
    nutrition: NutritionSchema.nullable(),
    breadcrumbs: z.array(z.object({ code: z.string(), name: z.string() })),
    variants: z.array(z.object({ id: z.string(), name: z.string().optional() })).nullable().optional()
  })
  .passthrough();

// Paginated results
export const SearchProductsPageSchema = z
  .object({
    items: z.array(ProductSummarySchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative().nullable()
  })
  .passthrough();

