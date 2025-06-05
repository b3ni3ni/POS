/**
 * Sales Service
 * Manages sales transactions, order processing, and inventory deduction.
 * Depends on ProductService and InventoryService.
 * Assumes models.js, productService.js, inventoryService.js are loaded globally.
 */
const SalesService = (function() {
    const STORAGE_KEY_SALES_HISTORY = 'pos_sales_history';
    const STORAGE_KEY_CURRENT_ORDER = 'pos_current_order';

    let salesHistory = [];
    let currentOrder = {
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        orderNumber: Date.now() // Simple initial order number
    };

    /**
     * (Internal) Calculates subtotal and total for the current order.
     */
    function calculateOrderTotals() {
        currentOrder.subtotal = currentOrder.items.reduce((sum, item) => sum + item.totalItemPrice, 0);
        currentOrder.total = currentOrder.subtotal - currentOrder.discount;
    }

    /**
     * Loads sales history from localStorage.
     */
    function loadSalesHistory() {
        try {
            const storedHistory = localStorage.getItem(STORAGE_KEY_SALES_HISTORY);
            if (storedHistory) {
                salesHistory = JSON.parse(storedHistory);
                // Note: For now, sale objects are plain data. If they become class instances later,
                // re-instantiation logic would be needed here.
            }
        } catch (error) {
            console.error("Error loading sales history from localStorage:", error);
            salesHistory = [];
        }
    }

    /**
     * Saves sales history to localStorage.
     */
    function saveSalesHistory() {
        try {
            localStorage.setItem(STORAGE_KEY_SALES_HISTORY, JSON.stringify(salesHistory));
        } catch (error) {
            console.error("Error saving sales history to localStorage:", error);
        }
    }

    /**
     * Loads the current order from localStorage.
     */
    function loadCurrentOrder() {
        try {
            const storedOrder = localStorage.getItem(STORAGE_KEY_CURRENT_ORDER);
            if (storedOrder) {
                currentOrder = JSON.parse(storedOrder);
                // Note: Similar to sales history, if order items or chosenModifiers
                // were full class instances with methods, re-instantiation would be complex here.
                // For now, we rely on them being mostly data, and product/modifier details
                // are re-fetched or re-resolved when an item is added or manipulated.
            }
        } catch (error) {
            console.error("Error loading current order from localStorage:", error);
            // Keep default currentOrder if loading fails
        }
    }

    /**
     * Saves the current order to localStorage.
     */
    function saveCurrentOrder() {
        try {
            localStorage.setItem(STORAGE_KEY_CURRENT_ORDER, JSON.stringify(currentOrder));
        } catch (error) {
            console.error("Error saving current order to localStorage:", error);
        }
    }

    /**
     * Starts a new order, clearing the current one.
     * @returns {object} The new, empty current order.
     */
    function startNewOrder() {
        currentOrder = {
            id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // Unique order ID
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0,
            date: new Date().toISOString()
        };
        saveCurrentOrder();
        return getCurrentOrder(); // Return a copy
    }

    /**
     * Adds an item to the current order or updates its quantity if it already exists.
     * @param {string} productId - The ID of the product to add.
     * @param {number} quantity - The quantity to add.
     * @param {Array<object>} chosenModifiersData - Array of { modifierGroupId, optionId }
     * @returns {object|null} The updated current order or null on failure.
     */
    function addItemToOrder(productId, quantity, chosenModifiersData = []) {
        if (quantity <= 0) {
            console.warn("Quantity must be positive to add an item.");
            return null;
        }
        const product = ProductService.getProduct(productId);
        if (!product) {
            console.error(`Product with ID "${productId}" not found.`);
            return null;
        }

        let finalPricePerItem = product.basePrice;
        const resolvedChosenModifiers = [];

        for (const modData of chosenModifiersData) {
            const group = product.modifierGroups.find(g => g.id === modData.modifierGroupId);
            if (group) {
                const option = group.options.find(o => o.id === modData.optionId);
                if (option) {
                    finalPricePerItem += option.additionalPrice;
                    resolvedChosenModifiers.push({ // Store resolved option for details and ingredient usage
                        modifierGroupId: group.id,
                        modifierGroupName: group.name,
                        optionId: option.id,
                        optionName: option.name,
                        additionalPrice: option.additionalPrice,
                        additionalCost: option.additionalCost, // For potential future cost analysis
                        ingredientUsages: option.ingredientUsages.map(iu => ({ ...iu })) // Deep copy
                    });
                }
            }
        }

        // Check if item with exact same product and modifiers already exists
        // Create a signature for comparison (productID + sorted modifier option IDs)
        const modifierSignature = resolvedChosenModifiers.map(m => m.optionId).sort().join(',');
        const itemSignature = `${productId}_${modifierSignature}`;

        const existingItemIndex = currentOrder.items.findIndex(item => item.signature === itemSignature);

        if (existingItemIndex > -1) {
            currentOrder.items[existingItemIndex].quantity += quantity;
            currentOrder.items[existingItemIndex].totalItemPrice = currentOrder.items[existingItemIndex].quantity * currentOrder.items[existingItemIndex].finalPricePerItem;
        } else {
            currentOrder.items.push({
                id: `item_${Date.now()}_${Math.random().toString(36).substring(2,7)}`, // Unique ID for the order item line
                productId: product.id,
                productName: product.name,
                quantity: quantity,
                basePrice: product.basePrice,
                chosenModifiers: resolvedChosenModifiers,
                finalPricePerItem: finalPricePerItem,
                totalItemPrice: quantity * finalPricePerItem,
                signature: itemSignature // Store signature for easy comparison
            });
        }

        calculateOrderTotals();
        saveCurrentOrder();
        return getCurrentOrder();
    }

    /**
     * Updates the quantity of an item in the order. Removes if quantity is 0 or less.
     * @param {string} orderItemId - The unique ID of the order item line.
     * @param {number} newQuantity - The new quantity.
     * @returns {object} The updated current order.
     */
    function updateItemQuantityInOrder(orderItemId, newQuantity) {
        const itemIndex = currentOrder.items.findIndex(item => item.id === orderItemId);
        if (itemIndex === -1) {
            console.warn(`Item with ID ${orderItemId} not found in order.`);
            return getCurrentOrder();
        }

        if (newQuantity <= 0) {
            currentOrder.items.splice(itemIndex, 1);
        } else {
            currentOrder.items[itemIndex].quantity = newQuantity;
            currentOrder.items[itemIndex].totalItemPrice = newQuantity * currentOrder.items[itemIndex].finalPricePerItem;
        }

        calculateOrderTotals();
        saveCurrentOrder();
        return getCurrentOrder();
    }

    /**
     * Removes an item from the current order.
     * @param {string} orderItemId - The unique ID of the order item line.
     * @returns {object} The updated current order.
     */
    function removeItemFromOrder(orderItemId) {
        currentOrder.items = currentOrder.items.filter(item => item.id !== orderItemId);
        calculateOrderTotals();
        saveCurrentOrder();
        return getCurrentOrder();
    }

    /**
     * Applies a discount to the current order.
     * @param {number} discountAmount - The amount of the discount.
     * @returns {object} The updated current order.
     */
    function applyDiscount(discountAmount) {
        if (typeof discountAmount !== 'number' || discountAmount < 0) {
            console.warn("Invalid discount amount.");
            return getCurrentOrder();
        }
        currentOrder.discount = discountAmount;
        calculateOrderTotals(); // Recalculate total based on new discount
        saveCurrentOrder();
        return getCurrentOrder();
    }

    /**
     * Returns a deep copy of the current order.
     * @returns {object} A copy of the current order.
     */
    function getCurrentOrder() {
        // Simple deep copy for plain data objects
        return JSON.parse(JSON.stringify(currentOrder));
    }

    /**
     * Finalizes the current sale, deducts inventory, and clears the order.
     * @param {string} paymentMethod - The method of payment (e.g., "cash", "card").
     * @returns {object|null} The sale transaction object or null on failure.
     */
    function finalizeSale(paymentMethod) {
        if (!currentOrder.items || currentOrder.items.length === 0) {
            console.error("Cannot finalize sale: order is empty.");
            return null;
        }
        if (!paymentMethod || typeof paymentMethod !== 'string') {
            console.error("Payment method is required to finalize sale.");
            return null;
        }

        const saleTransaction = {
            id: `sale_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            date: new Date().toISOString(),
            items: JSON.parse(JSON.stringify(currentOrder.items)), // Deep copy
            subtotal: currentOrder.subtotal,
            discount: currentOrder.discount,
            total: currentOrder.total,
            paymentMethod: paymentMethod,
            orderId: currentOrder.id // Link to the order ID
        };

        // Inventory Deduction
        let allDeductionsSuccessful = true;
        for (const item of saleTransaction.items) {
            const productDetails = ProductService.getProduct(item.productId);
            if (!productDetails) {
                console.error(`Product ${item.productId} not found during inventory deduction. Skipping deductions for this item.`);
                allDeductionsSuccessful = false; // Or handle more gracefully, e.g., revert sale
                continue;
            }

            // Deduct for base recipe
            for (const usage of productDetails.recipe) {
                const updatedIng = InventoryService.updateIngredientStock(usage.ingredientId, -usage.quantityUsed * item.quantity);
                if (!updatedIng) allDeductionsSuccessful = false; // Log error inside updateIngredientStock
            }

            // Deduct for chosen modifiers
            for (const modifier of item.chosenModifiers) {
                if (modifier.ingredientUsages && modifier.ingredientUsages.length > 0) {
                    for (const usage of modifier.ingredientUsages) {
                         const updatedIng = InventoryService.updateIngredientStock(usage.ingredientId, -usage.quantityUsed * item.quantity);
                         if (!updatedIng) allDeductionsSuccessful = false;
                    }
                }
            }
        }

        if (!allDeductionsSuccessful) {
            // This is a critical issue. Depending on policy, might want to stop the sale,
            // or log it for manual reconciliation. For now, just log and proceed.
            console.warn("Some inventory deductions may have failed. Please check logs and inventory levels.");
        }

        salesHistory.push(saleTransaction);
        saveSalesHistory();
        startNewOrder(); // Clears currentOrder and saves it

        return saleTransaction;
    }

    /**
     * Returns a copy of the sales history.
     * @returns {Array} A copy of the sales history.
     */
    function getSalesHistory() {
        return JSON.parse(JSON.stringify(salesHistory));
    }

    // --- Initialization ---
    loadCurrentOrder();
    loadSalesHistory();
    if (!currentOrder.id) { // If there's no persisted order, or it's an old format without an ID
        startNewOrder(); // Initialize with a proper new order structure
    }


    // --- Public API ---
    return {
        startNewOrder,
        addItemToOrder,
        updateItemQuantityInOrder,
        removeItemFromOrder,
        applyDiscount,
        getCurrentOrder,
        finalizeSale,
        getSalesHistory,
        // Exposing these mainly for debugging or specific scenarios, not typical UI use
        loadCurrentOrder,
        loadSalesHistory
    };
})();

// Example Usage (assuming ProductService and InventoryService are available)
/*
if (typeof ProductService === 'undefined' || typeof InventoryService === 'undefined') {
    console.error("ProductService and InventoryService are required for SalesService example.");
} else {
    // 0. Start a new order (usually done automatically or by a UI button)
    SalesService.startNewOrder();
    console.log("Initial Order:", SalesService.getCurrentOrder());

    // 1. Add items (assuming product IDs 'prod_latte_id', 'prod_muffin_id' exist)
    // And InventoryService has ingredients like 'ing_coffee_beans', 'ing_milk'
    // Ensure products and ingredients are set up in their respective services for this to work.
    // For simplicity, we'll assume product IDs directly.
    // In a real app, you'd get these from ProductService.listProducts()

    // Mock ProductService.getProduct for example if not running full app
    const mockProductService = {
        getProduct: (id) => {
            if (id === 'prod_latte_id') return new Product(id, 'Latte', 'Coffee', 3.00, 1.0, 'SKU001', [{ingredientId: 'beans', quantityUsed: 10}],
                [new ModifierGroup('mg1', 'Size', [new ModifierOption('mo1s', 'Small', 0, 0), new ModifierOption('mo1l', 'Large', 0.5, 0.75, [{ingredientId: 'extra_milk', quantityUsed: 50}])])]);
            if (id === 'prod_muffin_id') return new Product(id, 'Muffin', 'Bakery', 2.00, 0.5, 'SKU002', [{ingredientId: 'flour', quantityUsed: 50}]);
            return null;
        }
    };
    // const originalProductService = ProductService; // backup
    // ProductService = mockProductService; // temporary override for example

    SalesService.addItemToOrder('prod_latte_id', 1, [{modifierGroupId: 'mg1', optionId: 'mo1l'}]); // Latte Large
    SalesService.addItemToOrder('prod_muffin_id', 2); // 2 Muffins
    SalesService.addItemToOrder('prod_latte_id', 1); // Another Small Latte (no modifiers specified defaults to base)

    let currentOrderState = SalesService.getCurrentOrder();
    console.log("Order after adding items:", JSON.stringify(currentOrderState, null, 2));

    // 2. Update quantity of the first item (Latte Large)
    if (currentOrderState.items.length > 0) {
        SalesService.updateItemQuantityInOrder(currentOrderState.items[0].id, 3); // Update Latte Large to 3
        currentOrderState = SalesService.getCurrentOrder();
        console.log("Order after updating quantity:", JSON.stringify(currentOrderState, null, 2));
    }

    // 3. Apply a discount
    SalesService.applyDiscount(1.00);
    currentOrderState = SalesService.getCurrentOrder();
    console.log("Order after discount:", JSON.stringify(currentOrderState, null, 2));

    // 4. Finalize sale (mock inventory service for example if not running full app)
    const mockInventoryService = { updateIngredientStock: (id, qty) => { console.log(`Mock Deduct: ${id}, ${qty}`); return {id, name:id, quantity:100+qty}; } };
    // const originalInventoryService = InventoryService; // backup
    // InventoryService = mockInventoryService; // temporary override

    const sale = SalesService.finalizeSale("cash");
    if (sale) {
        console.log("Sale Finalized:", JSON.stringify(sale, null, 2));
        console.log("Sales History:", SalesService.getSalesHistory());
        console.log("Current order after sale (should be new/empty):", SalesService.getCurrentOrder());
    } else {
        console.log("Sale finalization failed.");
    }

    // ProductService = originalProductService; // restore
    // InventoryService = originalInventoryService; // restore
}
*/
