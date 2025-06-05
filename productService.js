/**
 * Product Service
 * Manages products, including their recipes and modifiers, and persists them to localStorage.
 * Depends on models from models.js (Ingredient, IngredientUsage, ModifierOption, ModifierGroup, Product, generateUniqueId).
 * Assumes models.js is loaded globally before this script.
 */
const ProductService = (function() {
    const STORAGE_KEY = 'pos_products';
    let products = []; // Private variable to hold Product objects

    /**
     * Loads products from localStorage.
     * Parses the data and re-instantiates each item and its nested objects
     * as their respective class instances.
     */
    function loadProducts() {
        try {
            const storedProducts = localStorage.getItem(STORAGE_KEY);
            if (storedProducts) {
                const parsedProducts = JSON.parse(storedProducts);
                products = parsedProducts.map(productData => {
                    // Re-instantiate IngredientUsage in recipe
                    const recipe = (productData.recipe || []).map(usageData =>
                        new IngredientUsage(usageData.ingredientId, usageData.quantityUsed)
                    );

                    // Re-instantiate ModifierGroups and their ModifierOptions
                    const modifierGroups = (productData.modifierGroups || []).map(groupData => {
                        const options = (groupData.options || []).map(optionData => {
                            const ingredientUsages = (optionData.ingredientUsages || []).map(usageData =>
                                new IngredientUsage(usageData.ingredientId, usageData.quantityUsed)
                            );
                            return new ModifierOption(
                                optionData.id,
                                optionData.name,
                                optionData.additionalCost,
                                optionData.additionalPrice,
                                ingredientUsages
                            );
                        });
                        return new ModifierGroup(groupData.id, groupData.name, options);
                    });

                    return new Product(
                        productData.id,
                        productData.name,
                        productData.category,
                        productData.basePrice,
                        productData.baseCost,
                        productData.sku,
                        recipe,
                        modifierGroups
                    );
                });
            } else {
                products = [];
            }
        } catch (error) {
            console.error("Error loading products from localStorage:", error);
            products = [];
        }
    }

    /**
     * Saves the current products array to localStorage.
     */
    function saveProducts() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        } catch (error) {
            console.error("Error saving products to localStorage:", error);
        }
    }

    /**
     * Adds a new product.
     * @param {object} productData - Data for the new product.
     * @returns {Product|null} The new Product object or null if creation failed.
     */
    function addProduct(productData) {
        if (!productData || typeof productData.name !== 'string' || productData.name.trim() === '') {
            console.error("Invalid product data: name is required.");
            return null;
        }
        if (products.some(p => p.name.toLowerCase() === productData.name.toLowerCase())) {
            console.warn(`Product with name "${productData.name}" already exists.`);
            return null;
        }
        if (productData.sku && productData.sku.trim() !== '' && products.some(p => p.sku && p.sku.toLowerCase() === productData.sku.toLowerCase())) {
            console.warn(`Product with SKU "${productData.sku}" already exists.`);
            return null;
        }

        try {
            const recipe = (productData.recipe || []).map(usageData =>
                new IngredientUsage(usageData.ingredientId, usageData.quantityUsed)
            );

            const modifierGroups = (productData.modifierGroups || []).map(groupData => {
                const options = (groupData.options || []).map(optionData => {
                    const ingredientUsages = (optionData.ingredientUsages || []).map(usageData =>
                        new IngredientUsage(usageData.ingredientId, usageData.quantityUsed)
                    );
                    // ModifierOption ID can be null to be auto-generated
                    return new ModifierOption(optionData.id || null, optionData.name, optionData.additionalCost, optionData.additionalPrice, ingredientUsages);
                });
                 // ModifierGroup ID can be null to be auto-generated
                return new ModifierGroup(groupData.id || null, groupData.name, options);
            });

            // Product ID can be null to be auto-generated by the Product constructor
            const newProduct = new Product(
                null, // ID will be generated by constructor
                productData.name,
                productData.category,
                parseFloat(productData.basePrice) || 0,
                parseFloat(productData.baseCost) || 0,
                productData.sku || '',
                recipe,
                modifierGroups
            );

            products.push(newProduct);
            saveProducts();
            return newProduct;
        } catch (error) {
            console.error("Error creating new product instance:", error);
            return null;
        }
    }

    /**
     * Retrieves a product by its ID.
     * @param {string} productId - The ID of the product.
     * @returns {Product|undefined} The Product object or undefined if not found.
     */
    function getProduct(productId) {
        return products.find(p => p.id === productId);
    }

    /**
     * Returns a copy of the current list of products.
     * @returns {Product[]} A copy of the products array.
     */
    function listProducts() {
        return [...products];
    }

    /**
     * Updates an existing product.
     * @param {string} productId - The ID of the product to update.
     * @param {object} updatedData - An object containing the fields to update.
     * @returns {Product|null} The updated Product or null if not found or update failed.
     */
    function updateProduct(productId, updatedData) {
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            console.error(`Product with ID "${productId}" not found for update.`);
            return null;
        }

        const existingProduct = products[productIndex];

        // Check for name/SKU conflicts if they are being changed
        if (updatedData.name && updatedData.name !== existingProduct.name && products.some(p => p.name.toLowerCase() === updatedData.name.toLowerCase() && p.id !== productId)) {
            console.warn(`Another product with name "${updatedData.name}" already exists.`);
            return null;
        }
        if (updatedData.sku && updatedData.sku.trim() !== '' && updatedData.sku !== existingProduct.sku && products.some(p => p.sku && p.sku.toLowerCase() === updatedData.sku.toLowerCase() && p.id !== productId)) {
            console.warn(`Another product with SKU "${updatedData.sku}" already exists.`);
            return null;
        }

        try {
            const newProductData = { ...products[productIndex], ...updatedData };

            // Re-instantiate nested objects if their data is provided in updatedData
            const recipe = (newProductData.recipe || []).map(usageData =>
                usageData instanceof IngredientUsage ? usageData : new IngredientUsage(usageData.ingredientId, usageData.quantityUsed)
            );

            const modifierGroups = (newProductData.modifierGroups || []).map(groupData => {
                const options = (groupData.options || []).map(optionData => {
                    const ingredientUsages = (optionData.ingredientUsages || []).map(usageData =>
                        usageData instanceof IngredientUsage ? usageData : new IngredientUsage(usageData.ingredientId, usageData.quantityUsed)
                    );
                    return optionData instanceof ModifierOption ? optionData : new ModifierOption(optionData.id, optionData.name, optionData.additionalCost, optionData.additionalPrice, ingredientUsages);
                });
                return groupData instanceof ModifierGroup ? groupData : new ModifierGroup(groupData.id, groupData.name, options);
            });

            // Create a new Product instance with all merged and re-instantiated data
            // Pass the original ID to maintain it
            const updatedProduct = new Product(
                existingProduct.id,
                newProductData.name,
                newProductData.category,
                parseFloat(newProductData.basePrice) || 0,
                parseFloat(newProductData.baseCost) || 0,
                newProductData.sku || '',
                recipe,
                modifierGroups
            );

            products[productIndex] = updatedProduct;
            saveProducts();
            return updatedProduct;
        } catch (error) {
            console.error("Error updating product instance:", error);
            return null;
        }
    }

    /**
     * Removes a product by its ID.
     * @param {string} productId - The ID of the product to remove.
     * @returns {boolean} True if successful, false otherwise.
     */
    function removeProduct(productId) {
        const initialLength = products.length;
        products = products.filter(p => p.id !== productId);
        if (products.length < initialLength) {
            saveProducts();
            return true;
        }
        console.warn(`Product with ID "${productId}" not found for removal.`);
        return false;
    }

    // --- Initialization ---
    loadProducts();

    // --- Public API ---
    return {
        addProduct,
        getProduct,
        listProducts,
        updateProduct,
        removeProduct,
        loadProducts, // For testing or re-loading if ever needed
        saveProducts  // For testing or explicit saving if ever needed
    };
})();

// Example Usage (assuming models.js is loaded)
/*
if (typeof generateUniqueId === 'undefined' || typeof Ingredient === 'undefined') {
    console.error("models.js is required for ProductService example to run.");
} else {
    // Example: Adding a new product
    const latteData = {
        name: "Latte Deluxe",
        category: "Coffee",
        basePrice: 4.50,
        baseCost: 1.50,
        sku: "COF-LAT-DLX",
        recipe: [
            { ingredientId: "coffee_bean_id_placeholder", quantityUsed: 18 }, // Replace with actual ID from InventoryService
            { ingredientId: "milk_id_placeholder", quantityUsed: 200 }      // Replace with actual ID
        ],
        modifierGroups: [
            {
                // id: null, // Auto-generated
                name: "Milk Options",
                options: [
                    { name: "Whole Milk", additionalCost: 0, additionalPrice: 0 }, // Default
                    { name: "Soy Milk", additionalCost: 0.2, additionalPrice: 0.75, ingredientUsages: [{ingredientId: "soy_milk_id_placeholder", quantityUsed: 200}] },
                    { name: "Almond Milk", additionalCost: 0.25, additionalPrice: 0.75 }
                ]
            },
            {
                name: "Flavor Shots",
                options: [
                    { name: "Vanilla Syrup", additionalCost: 0.1, additionalPrice: 0.50, ingredientUsages: [{ingredientId: "vanilla_syrup_id", quantityUsed: 15}] },
                    { name: "Caramel Syrup", additionalCost: 0.1, additionalPrice: 0.50 }
                ]
            }
        ]
    };

    const addedProduct = ProductService.addProduct(latteData);
    if (addedProduct) {
        console.log("Added Product:", addedProduct);
    } else {
        console.log("Failed to add product (check console for warnings).");
    }

    const allProducts = ProductService.listProducts();
    console.log("\nAll Products:", allProducts);

    if (addedProduct) {
        const fetchedProduct = ProductService.getProduct(addedProduct.id);
        console.log("\nFetched Product:", fetchedProduct);

        // Example: Updating the product
        const updatedData = {
            basePrice: 4.75,
            // Example of updating a modifier group (could be more complex for specific option changes)
            modifierGroups: [
                fetchedProduct.modifierGroups[0], // Keep the first group
                { // Add or replace the second group
                    name: "Flavor Shots Deluxe",
                    options: [
                        { name: "Vanilla Syrup", additionalCost: 0.12, additionalPrice: 0.60, ingredientUsages: [{ingredientId: "vanilla_syrup_id", quantityUsed: 15}] },
                        { name: "Hazelnut Syrup", additionalCost: 0.15, additionalPrice: 0.60 }
                    ]
                }
            ]
        };
        const trulyUpdatedProduct = ProductService.updateProduct(addedProduct.id, updatedData);
        if (trulyUpdatedProduct) {
            console.log("\nUpdated Product:", trulyUpdatedProduct);
        } else {
             console.log("Failed to update product.");
        }

        // Example: Removing the product
        // const removeSuccess = ProductService.removeProduct(addedProduct.id);
        // console.log("\nProduct removal successful:", removeSuccess);
        // console.log("Products after removal:", ProductService.listProducts());
    }
}
*/
