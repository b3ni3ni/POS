/**
 * Reporting Service
 * Provides data for various reports by processing data from other services.
 * Depends on SalesService, InventoryService, ProductService, and models.js.
 */
const ReportingService = (function() {

    /**
     * (Internal Helper) Calculates the cost of a single sold order item.
     * @param {object} soldItem - An item object from a sale transaction.
     * @returns {number} The cost for one unit of that sold item configuration.
     */
    function _calculateSoldItemCost(soldItem) {
        if (!soldItem || !soldItem.productId) {
            console.error("Invalid sold item data for cost calculation:", soldItem);
            return 0;
        }
        const product = ProductService.getProduct(soldItem.productId);
        if (!product) {
            console.error(`Product with ID ${soldItem.productId} not found for cost calculation.`);
            return 0; // Or handle as a significant error depending on desired strictness
        }

        let totalAdditionalCost = 0;
        if (soldItem.chosenModifiers && Array.isArray(soldItem.chosenModifiers)) {
            soldItem.chosenModifiers.forEach(modifier => {
                // The resolved chosenModifiers on the sale item should have additionalCost
                totalAdditionalCost += (modifier.additionalCost || 0);
            });
        }
        return product.baseCost + totalAdditionalCost;
    }

    /**
     * Generates a sales summary report for a given period.
     * @param {string|Date} [startDate] - Optional start date (ISO string or Date object).
     * @param {string|Date} [endDate] - Optional end date (ISO string or Date object).
     * @returns {object} An object containing the sales summary.
     */
    function generateSalesSummaryReport(startDate, endDate) {
        const salesHistory = SalesService.getSalesHistory();

        const sDate = startDate ? new Date(startDate) : null;
        const eDate = endDate ? new Date(endDate) : null;
        if (eDate) eDate.setHours(23, 59, 59, 999); // Include the whole end day

        const filteredSales = salesHistory.filter(sale => {
            const saleDate = new Date(sale.date);
            if (sDate && saleDate < sDate) return false;
            if (eDate && saleDate > eDate) return false;
            return true;
        });

        let totalSalesCount = filteredSales.length;
        let totalRevenue = 0;
        let totalDiscounts = 0;
        let totalCOGS = 0;
        const productSalesData = {}; // { productId: { name, quantitySold, revenueGenerated, cogs, profit } }
        const salesByPaymentMethod = {};

        filteredSales.forEach(sale => {
            totalRevenue += sale.total;
            totalDiscounts += sale.discount || 0;

            salesByPaymentMethod[sale.paymentMethod] = (salesByPaymentMethod[sale.paymentMethod] || 0) + sale.total;

            sale.items.forEach(item => {
                const product = ProductService.getProduct(item.productId); // For product name
                const productName = product ? product.name : 'Unknown Product';

                if (!productSalesData[item.productId]) {
                    productSalesData[item.productId] = {
                        productName: productName,
                        quantitySold: 0,
                        revenueGenerated: 0,
                        cogs: 0,
                        profit: 0
                    };
                }

                const itemCost = _calculateSoldItemCost(item);
                const itemRevenue = item.totalItemPrice; // Price including modifiers, for the quantity
                const itemCOGSForQuantity = itemCost * item.quantity;

                totalCOGS += itemCOGSForQuantity;

                productSalesData[item.productId].quantitySold += item.quantity;
                productSalesData[item.productId].revenueGenerated += itemRevenue;
                productSalesData[item.productId].cogs += itemCOGSForQuantity;
            });
        });

        const totalProfit = totalRevenue - totalCOGS;

        const topSellingItems = Object.entries(productSalesData)
            .map(([productId, data]) => ({
                productId,
                ...data,
                profit: data.revenueGenerated - data.cogs
            }))
            .sort((a, b) => b.revenueGenerated - a.revenueGenerated); // Sort by revenue by default

        return {
            period: {
                startDate: sDate ? sDate.toISOString().split('T')[0] : 'all_time',
                endDate: eDate ? eDate.toISOString().split('T')[0] : 'all_time'
            },
            totalSalesCount,
            totalRevenue,
            totalDiscounts,
            totalCOGS,
            totalProfit,
            topSellingItems, // Consider slicing for top N, e.g., .slice(0, 10)
            salesByPaymentMethod
        };
    }

    /**
     * Generates an inventory status report.
     * @returns {object} An object containing inventory status.
     */
    function generateInventoryStatusReport() {
        const ingredients = InventoryService.listIngredients();
        const lowStockIngredients = [];
        const outOfStockIngredients = [];
        const sufficientStockIngredients = [];

        ingredients.forEach(ingredient => {
            if (ingredient.quantity === 0) {
                outOfStockIngredients.push(ingredient);
            } else if (ingredient.isLowStock()) { // isLowStock from Ingredient model
                lowStockIngredients.push(ingredient);
            } else {
                sufficientStockIngredients.push(ingredient);
            }
        });

        // TODO: (Stretch Goal) Identify unmakeable products
        // This would involve:
        // 1. Getting all products: `ProductService.listProducts()`
        // 2. For each product, checking its recipe and all modifier option ingredient usages.
        // 3. Comparing required quantities against current ingredient stock.

        return {
            lowStockIngredients: lowStockIngredients.map(ing => ({ name: ing.name, unit: ing.unit, quantity: ing.quantity, reorderLevel: ing.reorderLevel })),
            outOfStockIngredients: outOfStockIngredients.map(ing => ({ name: ing.name, unit: ing.unit, quantity: ing.quantity, reorderLevel: ing.reorderLevel })),
            sufficientStockCount: sufficientStockIngredients.length,
            totalIngredientCount: ingredients.length
            // unmakeableProducts: [] // Placeholder for stretch goal
        };
    }

    /**
     * Generates a report on profit margin per product for a given period.
     * @param {string|Date} [startDate] - Optional start date.
     * @param {string|Date} [endDate] - Optional end date.
     * @returns {Array<object>} A list of products with their profit figures.
     */
    function generateProfitByProductReport(startDate, endDate) {
        const salesHistory = SalesService.getSalesHistory();

        const sDate = startDate ? new Date(startDate) : null;
        const eDate = endDate ? new Date(endDate) : null;
        if (eDate) eDate.setHours(23, 59, 59, 999);


        const filteredSales = salesHistory.filter(sale => {
            const saleDate = new Date(sale.date);
            if (sDate && saleDate < sDate) return false;
            if (eDate && saleDate > eDate) return false;
            return true;
        });

        const profitData = {}; // { productId: { name, totalRevenue, totalCOGS, totalProfit, quantitySold } }

        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const productDetails = ProductService.getProduct(item.productId);
                const productName = productDetails ? productDetails.name : 'Unknown Product';

                if (!profitData[item.productId]) {
                    profitData[item.productId] = {
                        productName: productName,
                        totalRevenue: 0,
                        totalCOGS: 0,
                        totalProfit: 0,
                        quantitySold: 0
                    };
                }

                const itemUnitCost = _calculateSoldItemCost(item);
                const itemRevenueForQuantity = item.totalItemPrice; // Already (finalPricePerItem * quantity)
                const itemCOGSForQuantity = itemUnitCost * item.quantity;

                profitData[item.productId].totalRevenue += itemRevenueForQuantity;
                profitData[item.productId].totalCOGS += itemCOGSForQuantity;
                profitData[item.productId].quantitySold += item.quantity;
            });
        });

        return Object.entries(profitData).map(([productId, data]) => ({
            productId,
            productName: data.productName,
            quantitySold: data.quantitySold,
            totalRevenue: data.totalRevenue,
            totalCOGS: data.totalCOGS,
            totalProfit: data.totalRevenue - data.totalCOGS,
            profitMargin: data.totalRevenue > 0 ? ((data.totalRevenue - data.totalCOGS) / data.totalRevenue) * 100 : 0
        })).sort((a,b) => b.totalProfit - a.totalProfit); // Sort by most profitable
    }

    // --- Public API ---
    return {
        generateSalesSummaryReport,
        generateInventoryStatusReport,
        generateProfitByProductReport
    };
})();

// Example Usage (assuming other services are populated)
/*
document.addEventListener('DOMContentLoaded', () => {
    if (typeof SalesService === 'undefined' || typeof InventoryService === 'undefined' || typeof ProductService === 'undefined') {
        console.error("ReportingService examples require SalesService, InventoryService, and ProductService to be loaded and populated.");
        return;
    }

    // Example: Generate sales summary for all time
    const salesSummary = ReportingService.generateSalesSummaryReport();
    console.log("Sales Summary (All Time):", salesSummary);

    // Example: Generate sales summary for a specific period (e.g., today)
    // const today = new Date().toISOString().split('T')[0];
    // const salesToday = ReportingService.generateSalesSummaryReport(today, today);
    // console.log("Sales Summary (Today):", salesToday);

    // Example: Inventory Status
    const inventoryStatus = ReportingService.generateInventoryStatusReport();
    console.log("\nInventory Status:", inventoryStatus);
    if(inventoryStatus.lowStockIngredients.length > 0) console.log("Low Stock:", inventoryStatus.lowStockIngredients);
    if(inventoryStatus.outOfStockIngredients.length > 0) console.log("Out of Stock:", inventoryStatus.outOfStockIngredients);

    // Example: Profit by Product
    const profitByProduct = ReportingService.generateProfitByProductReport();
    console.log("\nProfit by Product (All Time):", profitByProduct);
});
*/
