# Data Model: CanadianSupermarketApi (Superstore v1)

This document describes normalized domain entities and relationships for the client’s public contracts. External DTOs are mapped at the boundary into these shapes.

## Entities

### Product
- id: string (identifier used to request details)
- name: string
- description: string
- brand: string | null
- imageUrl: string | null (primary image)
- packageSize: string | null
- uom: string | null (e.g., EA, KG)
- pricing: Pricing
- nutrition: Nutrition | null
- breadcrumbs: Array<{ code: string; name: string }>
- variants: Array<{ id: string; name?: string }> | null

### Pricing
- current: number
- regular: number | null
- currency: string ("CAD")
- unitPrice: { value: number; unit: string; perQuantity: number } | null
- promo: { text?: string; expiresAt?: string } | null

### Nutrition
- serving: string | null
- calories: string | null
- macros: { fat: string | null; carbs: string | null; protein: string | null; sub: Record<string, string | null> }
- micros: Record<string, string | null>
- sodium: string | null
- cholesterol: string | null
- disclaimer: string | null
- ingredients: string | null

### Store
- id: string
- name: string
- pickupType: string
- address: { line1: string; line2?: string; town?: string; region?: string; postalCode?: string; country?: string }
- geo: { lat: number; lon: number } | null
- openNow: boolean | null

## Notes
- Prices denominated in CAD across all outputs and exclude tax (callers handle taxation separately).
- Availability and pricing are store-scoped.
- Raw upstream fields not included here are considered internal and may change without notice.

