import { z } from 'zod';

export const UnitPriceDtoSchema = z
  .object({ value: z.number().finite(), unit: z.string(), perQuantity: z.number().finite() })
  .passthrough();

export const PricingDtoSchema = z
  .object({
    current: z.number().finite(),
    regular: z.number().finite().nullable().optional(),
    unitPrice: UnitPriceDtoSchema.nullable().optional()
  })
  .passthrough();

export const ProductDTOSchema = z
  .object({
    code: z.string().min(1),
    name: z.string().min(1),
    brand: z.string().optional(),
    description: z.string().optional(),
    image: z.string().nullable().optional(),
    packageSize: z.string().nullable().optional(),
    uom: z.string().nullable().optional(),
    pricing: PricingDtoSchema.optional(),
    nutrition: z.unknown().nullable().optional(),
    breadcrumbs: z.array(z.object({ code: z.string(), name: z.string() })).optional(),
    variants: z.array(z.object({ code: z.string(), name: z.string().optional() })).nullable().optional()
  })
  .passthrough();

