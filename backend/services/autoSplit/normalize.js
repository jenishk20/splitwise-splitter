// Receipt item normalization.
//
// Raw receipt strings are noisy and store-specific ("MLK 2% GAL", "Organic
// Whole Milk", "GV MILK"). To learn "this person always takes the milk" we
// first collapse each raw string into:
//   - canonicalItem: a cleaned, lowercased key for exact-item history
//   - category:      a coarse grocery category for backoff when the exact
//                    item has never been seen before
//
// This is the deterministic baseline used by the predictor and tests. It needs
// no API key. The seam `canonicalizeItem` is intentionally the single place to
// swap in an LLM-backed normalizer later (Claude: raw string -> {canonicalItem,
// category}) without the predictor knowing or caring.

// Coarse category keyword map. Order matters: first matching category wins, so
// list more specific signals (alcohol) before broader ones (beverage).
const CATEGORY_KEYWORDS = [
  ["alcohol", ["beer", "wine", "vodka", "whiskey", "tequila", "ipa", "lager", "seltzer", "cider"]],
  ["dairy", ["milk", "cheese", "yogurt", "butter", "cream", "paneer", "ghee"]],
  ["produce", ["apple", "banana", "tomato", "onion", "potato", "spinach", "lettuce", "berry", "berries", "avocado", "pepper", "carrot", "mango", "lemon", "lime", "garlic", "ginger", "cilantro"]],
  ["meat", ["chicken", "beef", "pork", "lamb", "turkey", "bacon", "sausage", "mutton", "fish", "shrimp", "salmon"]],
  ["bakery", ["bread", "bagel", "bun", "croissant", "muffin", "tortilla", "naan", "roti"]],
  ["beverage", ["soda", "coke", "pepsi", "juice", "coffee", "tea", "water", "redbull", "gatorade", "kombucha"]],
  ["snacks", ["chips", "cookie", "candy", "chocolate", "cracker", "popcorn", "nuts", "granola", "bar"]],
  ["frozen", ["frozen", "icecream", "ice cream", "pizza", "nugget", "fries"]],
  ["pantry", ["rice", "pasta", "flour", "sugar", "oil", "salt", "sauce", "beans", "lentil", "dal", "spice", "masala", "cereal", "oats", "honey", "ketchup"]],
  ["household", ["towel", "tissue", "detergent", "soap", "cleaner", "trash", "bag", "foil", "wrap", "sponge", "battery", "bulb"]],
  ["personal-care", ["shampoo", "toothpaste", "deodorant", "razor", "lotion", "sanitizer", "floss", "brush"]],
];

// Tokens that carry no identity signal (units, sizes, packaging, filler).
const STOPWORDS = new Set([
  "lb", "lbs", "oz", "g", "kg", "gal", "gallon", "ct", "pk", "pack", "ea",
  "each", "the", "of", "and", "with", "organic", "fresh", "natural", "great",
  "value", "brand", "select", "premium", "large", "small", "medium", "xl",
]);

function cleanTokens(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/\$\s*\d+(\.\d+)?/g, " ") // strip prices
    .replace(/[^a-z\s]/g, " ") // strip digits/punctuation
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function categorize(tokens) {
  const hay = tokens.join(" ");
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => hay.includes(kw))) return category;
  }
  return "other";
}

// raw receipt string -> { canonicalItem, category }
function canonicalizeItem(rawName) {
  const tokens = cleanTokens(rawName);
  const category = categorize(tokens);
  // Canonical key: the cleaned tokens. Falls back to the category when the
  // string had no usable tokens, so it never becomes an empty key.
  const canonicalItem = tokens.length ? tokens.join(" ") : category;
  return { canonicalItem, category };
}

module.exports = { canonicalizeItem };
