/**
 * Ingredients UI Management
 * Handles rendering and interactions for ingredient management.
 * Depends on InventoryService and DOM elements from index.html.
 */
const IngredientsUI = (function() {
    const addIngredientFormContainerId = 'add-ingredient-form-container';
    const ingredientListContainerId = 'ingredient-list-container';
    const lowStockAlertsContainerId = 'low-stock-alerts-container';

    /**
     * Renders the form for adding new ingredients.
     */
    function renderAddIngredientForm() {
        const container = document.getElementById(addIngredientFormContainerId);
        if (!container) {
            console.error(`Container not found: #${addIngredientFormContainerId}`);
            return;
        }

        container.innerHTML = `
            <form id="ingredient-form" class="space-y-4 p-4 bg-gray-50 rounded shadow">
                <div>
                    <label for="ing-name" class="block text-sm font-medium text-gray-700">Name:</label>
                    <input type="text" id="ing-name" name="name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                    <label for="ing-unit" class="block text-sm font-medium text-gray-700">Unit (e.g., grams, ml, pcs):</label>
                    <input type="text" id="ing-unit" name="unit" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                    <label for="ing-quantity" class="block text-sm font-medium text-gray-700">Starting Quantity:</label>
                    <input type="number" id="ing-quantity" name="quantity" required step="any" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                    <label for="ing-reorderLevel" class="block text-sm font-medium text-gray-700">Reorder Level:</label>
                    <input type="number" id="ing-reorderLevel" name="reorderLevel" required step="any" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                    <label for="ing-supplierInfo" class="block text-sm font-medium text-gray-700">Supplier Info (Optional):</label>
                    <input type="text" id="ing-supplierInfo" name="supplierInfo" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <button type="submit" class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Add Ingredient
                </button>
                <div id="ingredient-form-feedback" class="mt-2 text-sm"></div>
            </form>
        `;

        const form = document.getElementById('ingredient-form');
        form.addEventListener('submit', handleAddIngredient);
    }

    /**
     * Handles the submission of the add ingredient form.
     * @param {Event} event - The form submission event.
     */
    function handleAddIngredient(event) {
        event.preventDefault();
        const feedbackDiv = document.getElementById('ingredient-form-feedback');
        feedbackDiv.textContent = '';

        const name = event.target.name.value.trim();
        const unit = event.target.unit.value.trim();
        const quantity = parseFloat(event.target.quantity.value);
        const reorderLevel = parseFloat(event.target.reorderLevel.value);
        const supplierInfo = event.target.supplierInfo.value.trim();

        if (!name || !unit) {
            feedbackDiv.textContent = "Name and Unit are required.";
            feedbackDiv.className = "mt-2 text-sm text-red-600";
            return;
        }
        if (isNaN(quantity) || isNaN(reorderLevel)) {
            feedbackDiv.textContent = "Quantity and Reorder Level must be valid numbers.";
            feedbackDiv.className = "mt-2 text-sm text-red-600";
            return;
        }
         if (quantity < 0 || reorderLevel < 0) {
            feedbackDiv.textContent = "Quantity and Reorder Level cannot be negative.";
            feedbackDiv.className = "mt-2 text-sm text-red-600";
            return;
        }


        const result = InventoryService.addIngredient({ name, unit, quantity, reorderLevel, supplierInfo });

        if (result) {
            feedbackDiv.textContent = `Ingredient "${result.name}" added successfully.`;
            feedbackDiv.className = "mt-2 text-sm text-green-600";
            event.target.reset(); // Clear form
            renderIngredientList();
            renderLowStockAlerts();
        } else {
            feedbackDiv.textContent = "Failed to add ingredient. Name might already exist or data is invalid.";
            feedbackDiv.className = "mt-2 text-sm text-red-600";
        }
    }

    /**
     * Renders the list of all ingredients.
     */
    function renderIngredientList() {
        const container = document.getElementById(ingredientListContainerId);
        if (!container) {
            console.error(`Container not found: #${ingredientListContainerId}`);
            return;
        }
        container.innerHTML = '<h3 class="text-lg font-medium mb-2">Current Ingredients</h3>';

        const ingredients = InventoryService.listIngredients();
        if (ingredients.length === 0) {
            container.innerHTML += '<p class="text-gray-500">No ingredients in inventory yet.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'space-y-3';

        ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.className = 'p-3 bg-white shadow rounded-md border border-gray-200';
            li.innerHTML = `
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <strong class="text-blue-600">${ingredient.name}</strong> (${ingredient.unit})
                        <p class="text-sm text-gray-600">
                            Stock: ${ingredient.quantity}, Reorder at: ${ingredient.reorderLevel}
                            ${ingredient.supplierInfo ? `| Supplier: ${ingredient.supplierInfo}` : ''}
                        </p>
                    </div>
                    <div class="mt-2 sm:mt-0 flex items-center space-x-2 flex-wrap">
                        <input type="number" step="any" placeholder="Amount" class="ing-stock-change-amount-${ingredient.id} w-20 px-2 py-1 border border-gray-300 rounded-md text-sm" style="max-width: 80px;">
                        <button data-id="${ingredient.id}" class="update-stock-btn text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Update Stock</button>
                        <button data-id="${ingredient.id}" class="remove-ingredient-btn text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
                    </div>
                </div>
            `;
            ul.appendChild(li);
        });
        container.appendChild(ul);

        // Add event listeners
        container.querySelectorAll('.update-stock-btn').forEach(button => {
            button.addEventListener('click', handleUpdateStock);
        });
        container.querySelectorAll('.remove-ingredient-btn').forEach(button => {
            button.addEventListener('click', handleRemoveIngredient);
        });
    }

    /**
     * Handles updating the stock of an ingredient.
     */
    function handleUpdateStock(event) {
        const ingredientId = event.target.dataset.id;
        const amountInput = document.querySelector(`.ing-stock-change-amount-${ingredientId}`);
        const quantityChange = parseFloat(amountInput.value);

        if (isNaN(quantityChange)) {
            alert("Please enter a valid number for stock change.");
            return;
        }

        const updatedIngredient = InventoryService.updateIngredientStock(ingredientId, quantityChange);
        if (updatedIngredient) {
            // alert(`Stock for ${updatedIngredient.name} updated to ${updatedIngredient.quantity}.`);
            renderIngredientList();
            renderLowStockAlerts();
            amountInput.value = ''; // Clear input
        } else {
            alert("Failed to update stock.");
        }
    }

    /**
     * Handles removing an ingredient.
     */
    function handleRemoveIngredient(event) {
        const ingredientId = event.target.dataset.id;
        const ingredient = InventoryService.getIngredient(ingredientId);
        if (!ingredient) {
            alert("Ingredient not found.");
            return;
        }

        if (confirm(`Are you sure you want to remove ${ingredient.name}?`)) {
            const success = InventoryService.removeIngredient(ingredientId);
            if (success) {
                alert(`${ingredient.name} removed successfully.`);
                renderIngredientList();
                renderLowStockAlerts();
            } else {
                alert(`Failed to remove ${ingredient.name}.`);
            }
        }
    }

    /**
     * Renders alerts for ingredients that are low in stock.
     */
    function renderLowStockAlerts() {
        const container = document.getElementById(lowStockAlertsContainerId);
        if (!container) {
            console.error(`Container not found: #${lowStockAlertsContainerId}`);
            return;
        }
        container.innerHTML = '<h3 class="text-lg font-medium mb-2 text-yellow-600">Low Stock Alerts</h3>';

        const lowStockItems = InventoryService.checkLowStock();
        if (lowStockItems.length === 0) {
            container.innerHTML += '<p class="text-sm text-green-600">All ingredients are above reorder levels.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'list-disc list-inside space-y-1';
        lowStockItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'text-sm text-yellow-700';
            li.textContent = `${item.name} is low: ${item.quantity} ${item.unit} remaining (Reorder at ${item.reorderLevel} ${item.unit})`;
            ul.appendChild(li);
        });
        container.appendChild(ul);
    }

    /**
     * Initializes the Ingredients UI components.
     */
    function initIngredientsUI() {
        renderAddIngredientForm();
        renderIngredientList();
        renderLowStockAlerts();
    }

    // Expose public methods
    return {
        initIngredientsUI,
        // Expose render functions if they need to be called externally for refresh
        // For now, internal calls after actions are sufficient.
        // renderIngredientList,
        // renderLowStockAlerts
    };

})();

// Initialize the UI when the script loads and DOM is ready
// (assuming InventoryService is already available)
// document.addEventListener('DOMContentLoaded', IngredientsUI.initIngredientsUI);
// Instead of DOMContentLoaded, app.js will call initIngredientsUI
