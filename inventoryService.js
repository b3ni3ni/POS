/**
 * Inventory Service
 * Manages ingredients and persists them to localStorage.
 * Depends on Ingredient class from models.js (assumed to be loaded globally).
 */
const InventoryService = (function() {
    const STORAGE_KEY = 'pos_ingredients';
    let ingredients = []; // Private variable to hold Ingredient objects

    /**
     * Loads ingredients from localStorage.
     * Parses the data and re-instantiates each item as an Ingredient object.
     */
    function loadIngredients() {
        try {
            const storedIngredients = localStorage.getItem(STORAGE_KEY);
            if (storedIngredients) {
                const parsedIngredients = JSON.parse(storedIngredients);
                // Re-instantiate to ensure Ingredient class methods are available
                ingredients = parsedIngredients.map(ingData =>
                    new Ingredient(
                        ingData.id,
                        ingData.name,
                        ingData.unit,
                        ingData.quantity,
                        ingData.reorderLevel,
                        ingData.supplierInfo
                    )
                );
            } else {
                ingredients = []; // Default to empty array if nothing in storage
            }
        } catch (error) {
            console.error("Error loading ingredients from localStorage:", error);
            ingredients = []; // Default to empty array on error
        }
    }

    /**
     * Saves the current ingredients array to localStorage.
     */
    function saveIngredients() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
        } catch (error) {
            console.error("Error saving ingredients to localStorage:", error);
        }
    }

    /**
     * Adds a new ingredient to the inventory.
     * @param {object} ingredientData - Data for the new ingredient.
     * @returns {Ingredient|null} The new Ingredient object or null if creation failed (e.g., duplicate name).
     */
    function addIngredient(ingredientData) {
        if (!ingredientData || typeof ingredientData.name !== 'string' || ingredientData.name.trim() === '') {
            console.error("Invalid ingredient data: name is required.");
            return null;
        }
        const existingIngredient = ingredients.find(ing => ing.name.toLowerCase() === ingredientData.name.toLowerCase());
        if (existingIngredient) {
            console.warn(`Ingredient with name "${ingredientData.name}" already exists.`);
            return null; // Or throw new Error, or return existingIngredient
        }

        const newId = generateUniqueId(); // Assumes generateUniqueId is globally available from models.js
        const newIngredient = new Ingredient(
            newId,
            ingredientData.name,
            ingredientData.unit,
            parseFloat(ingredientData.quantity) || 0,
            parseFloat(ingredientData.reorderLevel) || 0,
            ingredientData.supplierInfo || ''
        );

        ingredients.push(newIngredient);
        saveIngredients();
        return newIngredient;
    }

    /**
     * Retrieves an ingredient by its ID.
     * @param {string} ingredientId - The ID of the ingredient to retrieve.
     * @returns {Ingredient|undefined} The Ingredient object or undefined if not found.
     */
    function getIngredient(ingredientId) {
        return ingredients.find(ing => ing.id === ingredientId);
    }

    /**
     * Returns a copy of the current list of ingredients.
     * @returns {Ingredient[]} A copy of the ingredients array.
     */
    function listIngredients() {
        // Return a shallow copy to prevent direct modification of the internal array
        return [...ingredients];
    }

    /**
     * Updates the stock quantity of an ingredient.
     * @param {string} ingredientId - The ID of the ingredient to update.
     * @param {number} quantityChange - The amount to change the stock by (positive to increase, negative to decrease).
     * @returns {Ingredient|null} The updated Ingredient object or null if not found or update failed.
     */
    function updateIngredientStock(ingredientId, quantityChange) {
        const ingredient = getIngredient(ingredientId);
        if (!ingredient) {
            console.error(`Ingredient with ID "${ingredientId}" not found for stock update.`);
            return null;
        }

        if (typeof quantityChange !== 'number' || isNaN(quantityChange)) {
            console.error(`Invalid quantityChange: ${quantityChange}. Must be a number.`);
            return null;
        }

        if (quantityChange > 0) {
            ingredient.increaseStock(quantityChange);
        } else if (quantityChange < 0) {
            ingredient.decreaseStock(Math.abs(quantityChange));
        } else {
            // No change, just return the ingredient
            return ingredient;
        }

        saveIngredients();
        return ingredient;
    }

    /**
     * Updates an existing ingredient's details (excluding stock, use updateIngredientStock for that).
     * @param {string} ingredientId - The ID of the ingredient to update.
     * @param {object} updatedData - An object containing the fields to update (e.g., name, unit, reorderLevel, supplierInfo).
     * @returns {Ingredient|null} The updated ingredient or null if not found or update failed.
     */
    function updateIngredientDetails(ingredientId, updatedData) {
        const ingredient = getIngredient(ingredientId);
        if (!ingredient) {
            console.error(`Ingredient with ID "${ingredientId}" not found for update.`);
            return null;
        }

        if (updatedData.name && typeof updatedData.name === 'string' && updatedData.name.trim() !== '') {
            // Check for name conflict if name is being changed
            const existingIngredient = ingredients.find(ing => ing.name.toLowerCase() === updatedData.name.toLowerCase() && ing.id !== ingredientId);
            if (existingIngredient) {
                console.warn(`Another ingredient with name "${updatedData.name}" already exists.`);
                return null;
            }
            ingredient.name = updatedData.name;
        }
        if (updatedData.unit && typeof updatedData.unit === 'string') {
            ingredient.unit = updatedData.unit;
        }
        if (typeof updatedData.reorderLevel === 'number' && !isNaN(updatedData.reorderLevel)) {
            ingredient.reorderLevel = updatedData.reorderLevel;
        }
        if (typeof updatedData.supplierInfo === 'string') {
            ingredient.supplierInfo = updatedData.supplierInfo;
        }
        // Note: 'quantity' should be updated via updateIngredientStock

        saveIngredients();
        return ingredient;
    }


    /**
     * Removes an ingredient from the inventory.
     * @param {string} ingredientId - The ID of the ingredient to remove.
     * @returns {boolean} True if successful, false otherwise.
     */
    function removeIngredient(ingredientId) {
        const initialLength = ingredients.length;
        ingredients = ingredients.filter(ing => ing.id !== ingredientId);
        if (ingredients.length < initialLength) {
            saveIngredients();
            return true;
        }
        console.warn(`Ingredient with ID "${ingredientId}" not found for removal.`);
        return false;
    }

    /**
     * Checks for ingredients that are low in stock.
     * @returns {Ingredient[]} An array of ingredients that are low in stock.
     */
    function checkLowStock() {
        return ingredients.filter(ing => ing.isLowStock());
    }

    // --- Initialization ---
    // Load ingredients from localStorage when the service is initialized.
    loadIngredients();

    // --- Public API ---
    return {
        loadIngredients, // Exposed for potential re-load, though typically not needed externally
        saveIngredients, // Exposed for potential explicit save, though typically not needed
        addIngredient,
        getIngredient,
        listIngredients,
        updateIngredientStock,
        updateIngredientDetails, // Added this function
        removeIngredient,      // Added this function
        checkLowStock
    };
})();

// Example Usage (assuming models.js and this file are loaded in HTML)
/*
// Make sure generateUniqueId is available or include it here if models.js isn't loaded first
if (typeof generateUniqueId === 'undefined') {
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }
}

// Add a new ingredient
const newIngredientData = {
    name: "Flour",
    unit: "grams",
    quantity: 5000,
    reorderLevel: 1000,
    supplierInfo: "Bakery Supplies Co."
};
const addedFlour = InventoryService.addIngredient(newIngredientData);
if (addedFlour) {
    console.log("Added Flour:", addedFlour);
} else {
    console.log("Failed to add Flour (maybe duplicate or invalid data).");
}

const coffeeBeansData = {
    name: "Premium Coffee Beans",
    unit: "grams",
    quantity: 200, // Low stock
    reorderLevel: 250,
    supplierInfo: "World Roasters"
};
InventoryService.addIngredient(coffeeBeansData);


// List all ingredients
console.log("\nAll Ingredients:", InventoryService.listIngredients());

// Get a specific ingredient
if (addedFlour) {
    const fetchedFlour = InventoryService.getIngredient(addedFlour.id);
    console.log("\nFetched Flour:", fetchedFlour);
}

// Update stock
if (addedFlour) {
    InventoryService.updateIngredientStock(addedFlour.id, -500); // Use 500g of flour
    console.log("\nFlour after stock update:", InventoryService.getIngredient(addedFlour.id));

    InventoryService.updateIngredientStock(addedFlour.id, 1000); // Restock 1000g of flour
    console.log("\nFlour after restocking:", InventoryService.getIngredient(addedFlour.id));
}

// Update details
if (addedFlour) {
    const updatedDetails = {
        name: "Premium All-Purpose Flour",
        supplierInfo: "Premium Bakery Supplies Co."
    };
    InventoryService.updateIngredientDetails(addedFlour.id, updatedDetails);
    console.log("\nFlour after details update:", InventoryService.getIngredient(addedFlour.id));
}


// Check for low stock ingredients
const lowStockIngredients = InventoryService.checkLowStock();
console.log("\nLow Stock Ingredients:", lowStockIngredients);
if (lowStockIngredients.length > 0) {
    lowStockIngredients.forEach(ing => {
        console.log(`${ing.name} is low. Current: ${ing.quantity}${ing.unit}, Reorder at: ${ing.reorderLevel}${ing.unit}`);
    });
} else {
    console.log("No ingredients are currently low in stock.");
}

// Remove an ingredient
// First, let's add one to remove
const sugarData = { name: "Sugar", unit: "kg", quantity: 100, reorderLevel: 20 };
const addedSugar = InventoryService.addIngredient(sugarData);
if (addedSugar) {
    console.log("\nAdded sugar for removal test:", addedSugar);
    const removeSuccess = InventoryService.removeIngredient(addedSugar.id);
    console.log("Removal successful?", removeSuccess);
    console.log("Sugar after removal (should be undefined):", InventoryService.getIngredient(addedSugar.id));
    console.log("All ingredients after removal:", InventoryService.listIngredients());
}

*/
