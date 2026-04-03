import type { Mood } from "../types/recipe.types.js";

const MOOD_GUIDELINES: Record<Mood, string> = {
  cozy:
    "Warm, comforting, hearty dishes — think dal, khichdi, halwa, masala chai-inspired flavors. Use spices like cinnamon, cardamom, cloves. Perfect for rainy days or cozy evenings.",
  highEnergy:
    "Protein-rich, bold, energizing dishes — think paneer tikka, egg bhurji, sprout chaat, rajma. High-protein, satisfying, and full of flavor to fuel an active day.",
  light:
    "Fresh, low-calorie, easy-to-digest dishes — think salads with Indian dressings, poha, idli, cucumber raita, fruit chaat. Minimal oil and light spices.",
};

const DIETARY_RULES: Record<string, string> = {
  vegan: "No dairy (no milk, paneer, ghee, curd), no eggs, no meat or fish.",
  jain: "No onion, no garlic, no root vegetables (potato, carrot, beetroot, radish, etc.).",
  keto: "Low-carb, high-fat. No rice, no wheat, no sugar, no starchy vegetables.",
  "gluten-free": "No wheat, no maida, no atta, no barley, no semolina (sooji).",
  none: "No dietary restrictions.",
};

function sanitize(input: string): string {
  return input.replace(/[\r\n\u0000-\u001F]/g, " ").trim();
}

export function buildRecipePrompt(
  currentMood: Mood,
  ingredients: string[],
  dietaryPreferences: string,
): string {
  const safeDietary = sanitize(dietaryPreferences);
  const safeIngredients = ingredients.map(sanitize);
  const moodGuideline = MOOD_GUIDELINES[currentMood];
  const dietaryRule =
    DIETARY_RULES[safeDietary.toLowerCase()] ??
    `Follow the "${safeDietary}" dietary requirement strictly.`;

  return `You are a professional Indian chef and nutritionist. Generate exactly 4 unique Indian recipes based on the user's current mood, available ingredients, and dietary preferences. Each recipe must be practical for a home cook in India — use commonly available Indian ingredients and cooking methods.

### User Context
- **Mood**: ${currentMood}
- **Available Ingredients**: ${safeIngredients.join(", ")}
- **Dietary Preference**: ${safeDietary}

### Mood Guidance
${moodGuideline}

### Dietary Rule
${dietaryRule}

### General Rules
1. Use ONLY the ingredients listed by the user. You may assume the user always has these basic Indian pantry staples even if not listed: salt, water, oil (mustard/sunflower/ghee), whole spices (cumin seeds, mustard seeds, turmeric, red chilli powder, coriander powder, garam masala), onion, garlic, and ginger.
2. The recipe must be achievable in a standard Indian home kitchen using common equipment: tawa, kadai, pressure cooker, or mixie.
3. Calorie count must be realistic and calculated per serving.
4. Tags must cover: mood, dietary preference, key ingredients, cuisine region (e.g. North Indian, South Indian), and meal type (breakfast/lunch/dinner/snack/dessert).
5. Generate exactly 4 unique recipes with mandatory variety:
   - Meal type: one breakfast, one lunch, one dinner, one snack or dessert
   - Cooking method: vary across (e.g. pressure-cooked, tawa-fried, steamed, raw/no-cook)
   - Difficulty level: aim for a spread — do not assign the same level to all 4
   - Flavor profile: vary across spicy, tangy, sweet, and savory
   - Do NOT repeat a title or primary cooking technique across the 4.

### Output Format
Respond with a single valid JSON array of exactly 4 objects. No explanation, no markdown fences, no extra text — just the raw JSON array.

[
  {
    "title": "<creative, appetizing recipe name>",
    "approxTimeToCook": <total time in minutes as a number>,
    "difficultyLevel": "<easy | medium | hard>",
    "ingredients": [
      "<ingredient with quantity, e.g. '1 cup basmati rice'>",
      ...
    ],
    "method": [
      {
        "heading": "<step heading, e.g. 'Prepare the tempering'>",
        "description": "<detailed step description>"
      },
      ...
    ],
    "calories": <estimated kcal per serving as a number>,
    "tags": ["<tag1>", "<tag2>", ...]
  },
  { ... },
  { ... },
  { ... }
]`;
}
