/**
 * Main Application Script (app.js)
 * Initializes the POS system and coordinates UI modules.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded. Initializing POS application...");

    // Initialize services first (they load data from localStorage)
    // Services are designed to self-initialize their data load (e.g., InventoryService calls loadIngredients() internally)
    // So, no explicit service init calls are needed here unless they had a specific init() function for other setup.

    // Initialize UI Modules
    try {
        if (typeof IngredientsUI !== 'undefined' && IngredientsUI.initIngredientsUI) {
            IngredientsUI.initIngredientsUI();
            console.log("IngredientsUI initialized.");
        } else {
            console.error("IngredientsUI is not available or initIngredientsUI function is missing.");
        }
    } catch (e) {
        console.error("Error initializing IngredientsUI:", e);
    }

    try {
        if (typeof ProductsUI !== 'undefined' && ProductsUI.initProductsUI) {
            ProductsUI.initProductsUI();
            console.log("ProductsUI initialized.");
        } else {
            console.error("ProductsUI is not available or initProductsUI function is missing.");
        }
    } catch (e) {
        console.error("Error initializing ProductsUI:", e);
    }

    try {
        if (typeof PosUI !== 'undefined' && PosUI.initPosUI) {
            PosUI.initPosUI();
            console.log("PosUI initialized.");
        } else {
            console.error("PosUI is not available or initPosUI function is missing.");
        }
    } catch (e) {
        console.error("Error initializing PosUI:", e);
    }

    try {
        if (typeof ReportsUI !== 'undefined' && ReportsUI.initReportsUI) {
            ReportsUI.initReportsUI();
            console.log("ReportsUI initialized.");
        } else {
            console.error("ReportsUI is not available or initReportsUI function is missing.");
        }
    } catch (e) {
        console.error("Error initializing ReportsUI:", e);
    }

    console.log("POS Application initialization sequence complete.");
});
