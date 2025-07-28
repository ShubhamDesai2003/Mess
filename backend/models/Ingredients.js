const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    unit: String, // optional, e.g., grams, pieces
    dishes: [String] // dish names that use this ingredient
  });
  