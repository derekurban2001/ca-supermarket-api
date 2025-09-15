export type Nutrition = {
  serving: string | null;
  calories: string | null;
  macros: { fat: string | null; carbs: string | null; protein: string | null; sub: Record<string, string | null> };
  micros: Record<string, string | null>;
  sodium: string | null;
  cholesterol: string | null;
  disclaimer: string | null;
  ingredients: string | null;
};

