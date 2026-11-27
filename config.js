// The Herfect Supabase project's public URL and publishable key; answers are insert-only for this key.
export const SUPABASE_URL = "https://yeoqkjfwwfgfshaqetrg.supabase.co";
export const SUPABASE_KEY = "sb_publishable_2HmY19jG2l29DA11_XyBGQ_fU3L12QJ";
export const SURVEY = "microgreen-1125";

export const QUESTIONS = {
  bought_gummies: {
    title: "Have you ever purchased gummy dietary supplements?",
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
  },
  brand: {
    title: "If you were choosing for yourself, which one would you be most likely to buy?",
    options: [
      { id: "herfect", label: "Herfect", note: "$59.99 / 28 servings", img: "assets/herfect.webp" },
      { id: "lemme", label: "Lemme", note: "$30 / 30 servings", img: "assets/lemme.webp" },
      { id: "gruns", label: "Grüns", note: "$66.65 / 28 servings", img: "assets/gruns.webp" },
      { id: "kulikuli", label: "Kuli Kuli", note: "$24.99 / 30 servings", img: "assets/kulikuli.webp" },
      { id: "ag1", label: "AG1", note: "$64 / 30 servings", img: "assets/ag1.webp" },
    ],
  },
  product: {
    title: "If you were choosing for yourself, which one would you be most likely to buy?",
    options: [
      { id: "fiber", label: "Fiber", img: "assets/fiber.webp" },
      { id: "creatine", label: "Creatine", img: "assets/creatine.webp" },
      { id: "magnesium", label: "Magnesium", img: "assets/magnesium.webp" },
      { id: "microgreens", label: "Microgreens", img: "assets/microgreens.webp" },
    ],
  },
  shape: {
    title: "Which gummy shape would you prefer to take every day?",
    options: [
      { id: "cat", label: "A", img: "assets/shape-a.webp" },
      { id: "bear", label: "B", img: "assets/shape-b.webp" },
      { id: "round", label: "C", img: "assets/shape-c.webp" },
    ],
  },
  packaging: {
    title: "Which type of packaging do you prefer?",
    options: [
      { id: "box", label: "Box with daily packs", img: "assets/pack-box.webp" },
      { id: "pouch", label: "Pouch", img: "assets/pack-pouch.webp" },
    ],
  },
  benefits: {
    title: "Which three of the following product benefits would most encourage you to buy it?",
    pick: 3,
    options: [
      { id: "ingredients50", label: "50+ ingredients, including fruits & veggies" },
      { id: "fiber5g", label: "5 g of dietary fiber" },
      { id: "vitamins8", label: "8 essential vitamins" },
      { id: "prebiotic5g", label: "5 g of prebiotic fiber" },
      { id: "superfoods", label: "Superfoods: mushrooms & moringa" },
      { id: "gut", label: "Gut health support" },
      { id: "microgreens", label: "Nutrient-dense microgreens" },
      { id: "energy", label: "Daily energy support" },
      { id: "powder1000", label: "1,000 mg of microgreens powder" },
      { id: "immune", label: "Immune support" },
    ],
  },
  influencers: {
    title: "Could you recommend 3 Instagram influencers that you like?",
  },
};
