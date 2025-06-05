// Helper function for generating unique IDs
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Represents an ingredient in the inventory.
 */
class Ingredient {
    constructor(id, name, unit, quantity, reorderLevel, supplierInfo = '') {
        this.id = id || generateUniqueId();
        this.name = name;
        this.unit = unit; // e.g., "grams", "mL", "pcs"
        this.quantity = quantity; // Current stock
        this.reorderLevel = reorderLevel; // Point at which to reorder
        this.supplierInfo = supplierInfo; // Optional supplier information
    }

    /**
     * Decreases the stock of the ingredient by the given amount.
     * Stock will not go below 0.
     * @param {number} amount - The amount to decrease.
     */
    decreaseStock(amount) {
        if (amount < 0) {
            console.warn(`Attempted to decrease stock for ${this.name} with a negative amount: ${amount}`);
            return;
        }
        this.quantity -= amount;
        if (this.quantity < 0) {
            this.quantity = 0;
        }
    }

    /**
     * Increases the stock of the ingredient by the given amount.
     * @param {number} amount - The amount to increase.
     */
    increaseStock(amount) {
        if (amount < 0) {
            console.warn(`Attempted to increase stock for ${this.name} with a negative amount: ${amount}`);
            return;
        }
        this.quantity += amount;
    }

    /**
     * Checks if the current stock is at or below the reorder level.
     * @returns {boolean} True if stock is low, false otherwise.
     */
    isLowStock() {
        return this.quantity <= this.reorderLevel;
    }
}

/**
 * Represents the usage of a specific quantity of an ingredient.
 * Used in product recipes and modifier options.
 */
class IngredientUsage {
    constructor(ingredientId, quantityUsed) {
        if (!ingredientId || typeof quantityUsed !== 'number' || quantityUsed < 0) {
            throw new Error("Invalid arguments for IngredientUsage constructor.");
        }
        this.ingredientId = ingredientId; // ID of the Ingredient
        this.quantityUsed = quantityUsed;
    }
}

/**
 * Represents a selectable option within a modifier group (e.g., "Soy Milk", "Extra Shot").
 */
class ModifierOption {
    constructor(id, name, additionalCost, additionalPrice, ingredientUsages = []) {
        this.id = id || generateUniqueId();
        this.name = name;
        this.additionalCost = additionalCost; // Additional cost to produce this option
        this.additionalPrice = additionalPrice; // Additional price for the customer
        this.ingredientUsages = ingredientUsages.map(usage =>
            usage instanceof IngredientUsage ? usage : new IngredientUsage(usage.ingredientId, usage.quantityUsed)
        ); // Array of IngredientUsage objects
    }
}

/**
 * Represents a group of related modifier options (e.g., "Milk Options", "Syrup Flavors").
 */
class ModifierGroup {
    constructor(id, name, options = []) {
        this.id = id || generateUniqueId();
        this.name = name; // e.g., "Milk Type", "Add-ons"
        this.options = options.map(opt =>
            opt instanceof ModifierOption ? opt : new ModifierOption(opt.id, opt.name, opt.additionalCost, opt.additionalPrice, opt.ingredientUsages)
        ); // Array of ModifierOption objects
    }
}

/**
 * Represents a product that can be sold.
 */
class Product {
    constructor(id, name, category, basePrice, baseCost, sku = '', recipe = [], modifierGroups = []) {
        this.id = id || generateUniqueId();
        this.name = name;
        this.category = category;
        this.basePrice = basePrice; // Base selling price
        this.baseCost = baseCost;   // Base cost to produce
        this.sku = sku;             // Optional Stock Keeping Unit

        // Recipe for the base product: array of IngredientUsage objects
        this.recipe = recipe.map(usage =>
            usage instanceof IngredientUsage ? usage : new IngredientUsage(usage.ingredientId, usage.quantityUsed)
        );

        // Modifier groups applicable to this product: array of ModifierGroup objects
        this.modifierGroups = modifierGroups.map(group =>
            group instanceof ModifierGroup ? group : new ModifierGroup(group.id, group.name, group.options)
        );
    }

    // Potential future methods for Product:
    // - calculateTotalPrice(selectedModifiers): Calculates price including selected modifiers.
    // - calculateTotalCost(selectedModifiers): Calculates cost including selected modifiers.
    // - getRequiredIngredients(selectedModifiers): Returns a list of all ingredients and quantities needed.
}

// Example Usage (optional, for testing - can be removed or commented out)
/*
try {
    // Ingredients
    const coffeeBeans = new Ingredient(null, "Coffee Beans", "grams", 1000, 200, "Local Roasters Inc.");
    const milk = new Ingredient(null, "Whole Milk", "mL", 5000, 1000, "Dairy Farm Co.");
    const sugar = new Ingredient(null, "Sugar", "grams", 2000, 500);

    console.log("Created Ingredients:", coffeeBeans, milk, sugar);
    coffeeBeans.decreaseStock(50);
    console.log("Coffee beans after decrease:", coffeeBeans.quantity); // 950
    console.log("Is milk low stock?", milk.isLowStock()); // false

    // Ingredient Usages
    const espressoShotUsage = new IngredientUsage(coffeeBeans.id, 18); // 18g for an espresso
    const milkForLatteUsage = new IngredientUsage(milk.id, 200); // 200mL for a latte

    // Modifier Options
    const soyMilkOption = new ModifierOption(null, "Soy Milk", 0.2, 0.75, [new IngredientUsage(milk.id, 0)]); // Assuming soy milk is pre-made, or replace milk.id with soy milk ingredient id
    const extraShotOption = new ModifierOption(null, "Extra Shot", 0.5, 1.00, [new IngredientUsage(coffeeBeans.id, 18)]);

    // Modifier Group
    const milkOptionsGroup = new ModifierGroup(null, "Milk Options", [
        new ModifierOption(null, "Whole Milk", 0, 0), // Default, no extra cost/price or ingredient change from base
        soyMilkOption
    ]);
    const addOnsGroup = new ModifierGroup(null, "Add-ons", [extraShotOption]);

    // Product
    const latte = new Product(
        null,
        "Latte",
        "Coffee",
        3.50,
        1.20,
        "LATTE001",
        [espressoShotUsage, milkForLatteUsage], // Base recipe for a standard latte
        [milkOptionsGroup, addOnsGroup]
    );

    console.log("\nCreated Product:", latte);
    console.log("Latte Recipe:", latte.recipe);
    console.log("Latte Modifier Groups:", latte.modifierGroups);
    latte.modifierGroups[0].options.forEach(opt => console.log("Milk Option:", opt.name, "Ingredients:", opt.ingredientUsages));

} catch (error) {
    console.error("Error in example usage:", error);
}
*/

// Export classes if using modules (e.g., Node.js or ES6 modules in browser)
// For simple browser script, they are available globally.
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = {
//         Ingredient,
//         IngredientUsage,
//         ModifierOption,
//         ModifierGroup,
//         Product,
//         generateUniqueId
//     };
// }
