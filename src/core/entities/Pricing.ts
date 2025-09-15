export type Pricing = {
  current: number;
  regular: number | null;
  currency: 'CAD';
  unitPrice?: { value: number; unit: string; perQuantity: number } | null;
  promo?: { text?: string; expiresAt?: string } | null;
};

