/**
 * Products UI Management
 * Handles rendering and interactions for product management.
 */
const ProductsUI = (function() {
    const addProductFormContainerId = 'add-product-form-container';
    const productListContainerId = 'product-list-container';
    const productFormFeedbackId = 'product-form-feedback';

    let currentEditProductId = null; // null for 'add' mode, productId for 'edit' mode
    let ingredientsCache = []; // Cache ingredients to avoid repeated calls

    /**
     * Fetches ingredients from InventoryService and caches them.
     */
    function loadIngredientsCache() {
        try {
            ingredientsCache = InventoryService.listIngredients();
        } catch (e) {
            console.error("Error loading ingredients for UI:", e);
            ingredientsCache = [];
        }
    }

    /**
     * Creates an HTML select element for ingredients.
     * @param {string} selectId - Base ID for the select element (will be made unique).
     * @param {string} selectedIngredientId - Optional ID of the ingredient to pre-select.
     * @returns {string} HTML string for the select element.
     */
    function createIngredientSelector(selectId, selectedIngredientId = null, baseClass = "product-recipe-ingredient") {
        if (ingredientsCache.length === 0) {
            return '<p class="text-xs text-red-500">No ingredients available. Add ingredients first.</p>';
        }
        let optionsHtml = '<option value="">-- Select Ingredient --</option>';
        ingredientsCache.forEach(ing => {
            optionsHtml += `<option value="${ing.id}" ${ing.id === selectedIngredientId ? 'selected' : ''}>${ing.name} (${ing.unit})</option>`;
        });
        return `<select id="${selectId}" name="${baseClass}-id" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${baseClass}">
                    ${optionsHtml}
                </select>`;
    }

    /**
     * Renders a row for a recipe item in the product form.
     */
    function renderRecipeItemRow(usage = null, index) {
        const ingredientId = usage ? usage.ingredientId : null;
        const quantityUsed = usage ? usage.quantityUsed : '';
        const uniqueId = `recipe_item_${index}_${Date.now()}`;

        const itemHtml = `
            <div class="recipe-item-row p-2 border border-gray-200 rounded mt-2 space-y-1" data-index="${index}">
                <label class="text-sm font-medium text-gray-600">Ingredient:</label>
                ${createIngredientSelector(`${uniqueId}_ingredient_select`, ingredientId, 'recipe-ingredient-select')}
                <label class="text-sm font-medium text-gray-600">Quantity Used:</label>
                <input type="number" name="recipe-quantity" value="${quantityUsed}" required step="any" min="0" class="recipe-quantity-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="e.g., 100">
                <button type="button" class="remove-recipe-item-btn text-xs px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500" data-index="${index}">Remove Ingredient</button>
            </div>
        `;
        return itemHtml;
    }

    /**
     * Renders a block for a modifier group in the product form.
     */
    function renderModifierGroupBlock(group = null, groupIndex) {
        const groupName = group ? group.name : '';
        const uniqueGroupId = `mod_group_${groupIndex}_${Date.now()}`;

        let optionsHtml = '';
        if (group && group.options) {
            group.options.forEach((opt, optIndex) => {
                optionsHtml += renderModifierOptionItemRow(opt, groupIndex, optIndex);
            });
        }

        const groupHtml = `
            <fieldset class="modifier-group-block border border-gray-300 p-3 mt-3 rounded" data-group-index="${groupIndex}">
                <legend class="text-md font-semibold text-gray-700 px-1">Modifier Group</legend>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Group Name (e.g., Size, Milk Type):</label>
                    <input type="text" name="modifier-group-name" value="${groupName}" required class="modifier-group-name-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="e.g., Milk Options">
                </div>
                <div class="modifier-options-container mt-2 space-y-2" id="${uniqueGroupId}_options_container">
                    ${optionsHtml}
                </div>
                <button type="button" class="add-modifier-option-btn mt-2 text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" data-group-index="${groupIndex}" data-options-container-id="${uniqueGroupId}_options_container">Add Option to this Group</button>
                <button type="button" class="remove-modifier-group-btn mt-2 text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" data-group-index="${groupIndex}">Remove This Group</button>
            </fieldset>
        `;
        return groupHtml;
    }

    /**
     * Renders a row for a modifier option within a group in the product form.
     */
    function renderModifierOptionItemRow(option = null, groupIndex, optionIndex) {
        const optionName = option ? option.name : '';
        const additionalCost = option ? option.additionalCost : 0;
        const additionalPrice = option ? option.additionalPrice : 0;
        const uniqueOptionId = `mod_group_${groupIndex}_option_${optionIndex}_${Date.now()}`;

        let ingredientUsagesHtml = '';
        if (option && option.ingredientUsages) {
            option.ingredientUsages.forEach((usage, usageIndex) => {
                ingredientUsagesHtml += renderModifierOptionIngredientUsageRow(usage, groupIndex, optionIndex, usageIndex);
            });
        }

        const optionHtml = `
            <div class="modifier-option-item p-2 border border-gray-200 rounded mt-2 space-y-1" data-group-index="${groupIndex}" data-option-index="${optionIndex}">
                <p class="text-sm font-medium text-gray-600">Option for Group ${groupIndex + 1}</p>
                <label class="block text-xs font-medium text-gray-700">Option Name (e.g., Large, Soy Milk):</label>
                <input type="text" name="modifier-option-name" value="${optionName}" required class="modifier-option-name-input mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="e.g., Soy Milk">
                <label class="block text-xs font-medium text-gray-700">Additional Cost:</label>
                <input type="number" name="modifier-option-addcost" value="${additionalCost}" required step="any" class="modifier-option-addcost-input mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm">
                <label class="block text-xs font-medium text-gray-700">Additional Price:</label>
                <input type="number" name="modifier-option-addprice" value="${additionalPrice}" required step="any" class="modifier-option-addprice-input mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm">

                <div class="text-xs font-medium text-gray-700 mt-1">Ingredients for this Option (if any):</div>
                <div class="modifier-option-ingredients-container space-y-1" id="${uniqueOptionId}_ingredients_container">
                    ${ingredientUsagesHtml}
                </div>
                <button type="button" class="add-ingredient-to-option-btn text-xs px-2 py-1 bg-blue-400 text-white rounded hover:bg-blue-500" data-group-index="${groupIndex}" data-option-index="${optionIndex}" data-option-ingredients-id="${uniqueOptionId}_ingredients_container">Add Ingredient to Option</button>
                <button type="button" class="remove-modifier-option-btn text-xs px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500">Remove Option</button>
            </div>
        `;
        return optionHtml;
    }

    /**
     * Renders a row for an ingredient usage within a modifier option.
     */
    function renderModifierOptionIngredientUsageRow(usage = null, groupIndex, optionIndex, usageIndex) {
        const ingredientId = usage ? usage.ingredientId : null;
        const quantityUsed = usage ? usage.quantityUsed : '';
        const uniqueId = `mod_group_${groupIndex}_option_${optionIndex}_usage_${usageIndex}_${Date.now()}`;

        return `
            <div class="modifier-option-ingredient-usage-row flex items-center space-x-2 p-1 border-t border-gray-100" data-usage-index="${usageIndex}">
                <div class="flex-grow">${createIngredientSelector(`${uniqueId}_mod_opt_ing_select`, ingredientId, 'mod-option-ingredient-select')}</div>
                <input type="number" name="mod-option-ingredient-quantity" value="${quantityUsed}" required step="any" min="0" class="mod-option-ingredient-quantity-input w-20 px-2 py-1 border border-gray-300 rounded-md sm:text-sm" placeholder="Qty">
                <button type="button" class="remove-ingredient-from-option-btn text-xs px-1 py-0.5 bg-red-300 text-white rounded hover:bg-red-400">&times;</button>
            </div>
        `;
    }


    /**
     * Renders the main form for adding or editing products.
     */
    function renderAddProductForm(productToEdit = null) {
        currentEditProductId = productToEdit ? productToEdit.id : null;
        loadIngredientsCache(); // Ensure ingredients are available for selectors

        const container = document.getElementById(addProductFormContainerId);
        if (!container) {
            console.error("Add product form container not found.");
            return;
        }

        const formTitle = currentEditProductId ? "Edit Product" : "Add New Product";

        container.innerHTML = `
            <form id="product-form" class="space-y-6 p-4 bg-gray-50 rounded shadow-lg">
                <h3 class="text-xl font-semibold">${formTitle}</h3>
                <input type="hidden" id="product-id" value="${currentEditProductId || ''}">

                <fieldset class="border p-3 rounded">
                    <legend class="text-lg font-medium text-gray-800 px-1">Basic Information</legend>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="prod-name" class="block text-sm font-medium text-gray-700">Name:</label>
                            <input type="text" id="prod-name" name="name" required class="mt-1 block w-full input-styling" value="${productToEdit?.name || ''}">
                        </div>
                        <div>
                            <label for="prod-category" class="block text-sm font-medium text-gray-700">Category:</label>
                            <input type="text" id="prod-category" name="category" required class="mt-1 block w-full input-styling" value="${productToEdit?.category || ''}">
                        </div>
                        <div>
                            <label for="prod-sku" class="block text-sm font-medium text-gray-700">SKU (Optional):</label>
                            <input type="text" id="prod-sku" name="sku" class="mt-1 block w-full input-styling" value="${productToEdit?.sku || ''}">
                        </div>
                        <div>
                            <label for="prod-basePrice" class="block text-sm font-medium text-gray-700">Base Price:</label>
                            <input type="number" id="prod-basePrice" name="basePrice" required step="0.01" min="0" class="mt-1 block w-full input-styling" value="${productToEdit?.basePrice || ''}">
                        </div>
                        <div>
                            <label for="prod-baseCost" class="block text-sm font-medium text-gray-700">Base Cost:</label>
                            <input type="number" id="prod-baseCost" name="baseCost" required step="0.01" min="0" class="mt-1 block w-full input-styling" value="${productToEdit?.baseCost || ''}">
                        </div>
                    </div>
                </fieldset>

                <fieldset class="border p-3 rounded">
                    <legend class="text-lg font-medium text-gray-800 px-1">Base Recipe</legend>
                    <div id="recipe-items-container" class="space-y-2">
                        ${(productToEdit?.recipe || []).map((usage, index) => renderRecipeItemRow(usage, index)).join('')}
                    </div>
                    <button type="button" id="add-recipe-item-btn" class="mt-2 text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Ingredient to Recipe</button>
                </fieldset>

                <fieldset class="border p-3 rounded">
                    <legend class="text-lg font-medium text-gray-800 px-1">Modifier Groups</legend>
                    <div id="modifier-groups-container" class="space-y-3">
                        ${(productToEdit?.modifierGroups || []).map((group, index) => renderModifierGroupBlock(group, index)).join('')}
                    </div>
                    <button type="button" id="add-modifier-group-btn" class="mt-2 text-sm px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Add Modifier Group</button>
                </fieldset>

                <button type="submit" class="w-full py-2 px-4 btn-primary">${currentEditProductId ? 'Update Product' : 'Save Product'}</button>
                <div id="${productFormFeedbackId}" class="mt-2 text-sm"></div>
            </form>
        `;

        // Attach event listeners for dynamic parts
        document.getElementById('add-recipe-item-btn').addEventListener('click', handleAddRecipeIngredientToForm);
        document.getElementById('add-modifier-group-btn').addEventListener('click', handleAddModifierGroupToForm);

        // Event delegation for dynamically added remove/add buttons within recipe/modifiers
        const form = document.getElementById('product-form');
        form.addEventListener('submit', handleAddOrUpdateProduct);
        form.addEventListener('click', handleDynamicFormClicks);

        // Helper class for inputs to avoid repetition - a bit hacky here, ideally done via CSS
        container.querySelectorAll('.input-styling').forEach(el => el.classList.add('px-3', 'py-2', 'border', 'border-gray-300', 'rounded-md', 'shadow-sm', 'focus:outline-none', 'focus:ring-indigo-500', 'focus:border-indigo-500', 'sm:text-sm'));
        container.querySelectorAll('.btn-primary').forEach(el => el.classList.add('border', 'border-transparent', 'rounded-md', 'shadow-sm', 'font-medium', 'text-white', 'bg-green-600', 'hover:bg-green-700', 'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-green-500'));

    }

    function handleDynamicFormClicks(event) {
        // Remove Recipe Item
        if (event.target.classList.contains('remove-recipe-item-btn')) {
            event.target.closest('.recipe-item-row').remove();
        }
        // Remove Modifier Group
        else if (event.target.classList.contains('remove-modifier-group-btn')) {
            event.target.closest('.modifier-group-block').remove();
        }
        // Add Modifier Option to Group
        else if (event.target.classList.contains('add-modifier-option-btn')) {
            const groupIndex = event.target.dataset.groupIndex;
            const optionsContainer = document.getElementById(event.target.dataset.optionsContainerId);
            const optionIndex = optionsContainer.children.length;
            optionsContainer.insertAdjacentHTML('beforeend', renderModifierOptionItemRow(null, parseInt(groupIndex), optionIndex));
        }
        // Remove Modifier Option
        else if (event.target.classList.contains('remove-modifier-option-btn')) {
            event.target.closest('.modifier-option-item').remove();
        }
        // Add Ingredient to Modifier Option
        else if (event.target.classList.contains('add-ingredient-to-option-btn')) {
            const groupIndex = event.target.dataset.groupIndex;
            const optionIndex = event.target.dataset.optionIndex;
            const ingredientsContainer = document.getElementById(event.target.dataset.optionIngredientsId);
            const usageIndex = ingredientsContainer.children.length;
            ingredientsContainer.insertAdjacentHTML('beforeend', renderModifierOptionIngredientUsageRow(null, parseInt(groupIndex), parseInt(optionIndex), usageIndex));
        }
        // Remove Ingredient From Modifier Option
        else if (event.target.classList.contains('remove-ingredient-from-option-btn')) {
            event.target.closest('.modifier-option-ingredient-usage-row').remove();
        }
    }

    function handleAddRecipeIngredientToForm() {
        const container = document.getElementById('recipe-items-container');
        const index = container.children.length;
        container.insertAdjacentHTML('beforeend', renderRecipeItemRow(null, index));
    }

    function handleAddModifierGroupToForm() {
        const container = document.getElementById('modifier-groups-container');
        const groupIndex = container.children.length;
        container.insertAdjacentHTML('beforeend', renderModifierGroupBlock(null, groupIndex));
    }

    /**
     * Collects data from the product form and structures it for the ProductService.
     */
    function collectProductFormData(form) {
        const productData = {
            name: form.name.value.trim(),
            category: form.category.value.trim(),
            sku: form.sku.value.trim(),
            basePrice: parseFloat(form.basePrice.value),
            baseCost: parseFloat(form.baseCost.value),
            recipe: [],
            modifierGroups: []
        };

        // Collect Recipe Items
        form.querySelectorAll('.recipe-item-row').forEach(row => {
            const ingredientId = row.querySelector('select[name="recipe-ingredient-select"]').value;
            const quantityUsed = parseFloat(row.querySelector('input[name="recipe-quantity"]').value);
            if (ingredientId && !isNaN(quantityUsed) && quantityUsed > 0) {
                productData.recipe.push({ ingredientId, quantityUsed });
            }
        });

        // Collect Modifier Groups
        form.querySelectorAll('.modifier-group-block').forEach(groupBlock => {
            const groupName = groupBlock.querySelector('input[name="modifier-group-name"]').value.trim();
            if (!groupName) return; // Skip empty group names

            const group = { name: groupName, options: [] };
            groupBlock.querySelectorAll('.modifier-option-item').forEach(optionItem => {
                const optionName = optionItem.querySelector('input[name="modifier-option-name"]').value.trim();
                if (!optionName) return; // Skip empty option names

                const option = {
                    name: optionName,
                    additionalCost: parseFloat(optionItem.querySelector('input[name="modifier-option-addcost"]').value),
                    additionalPrice: parseFloat(optionItem.querySelector('input[name="modifier-option-addprice"]').value),
                    ingredientUsages: []
                };

                optionItem.querySelectorAll('.modifier-option-ingredient-usage-row').forEach(usageRow => {
                    const ingredientId = usageRow.querySelector('select[name="mod-option-ingredient-select"]').value;
                    const quantityUsed = parseFloat(usageRow.querySelector('input[name="mod-option-ingredient-quantity"]').value);
                     if (ingredientId && !isNaN(quantityUsed) && quantityUsed > 0) {
                        option.ingredientUsages.push({ ingredientId, quantityUsed });
                    }
                });
                group.options.push(option);
            });
            if (group.options.length > 0) { // Only add group if it has options
                productData.modifierGroups.push(group);
            }
        });
        return productData;
    }

    /**
     * Handles form submission for adding or updating a product.
     */
    function handleAddOrUpdateProduct(event) {
        event.preventDefault();
        const feedbackDiv = document.getElementById(productFormFeedbackId);
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'mt-2 text-sm';

        const form = event.target;
        const productData = collectProductFormData(form);

        // Basic Validation (more can be added)
        if (!productData.name || !productData.category || isNaN(productData.basePrice) || isNaN(productData.baseCost)) {
            feedbackDiv.textContent = "Name, Category, Base Price, and Base Cost are required and must be valid.";
            feedbackDiv.className += ' text-red-600';
            return;
        }

        let result;
        if (currentEditProductId) {
            result = ProductService.updateProduct(currentEditProductId, productData);
        } else {
            result = ProductService.addProduct(productData);
        }

        if (result) {
            feedbackDiv.textContent = `Product "${result.name}" ${currentEditProductId ? 'updated' : 'added'} successfully.`;
            feedbackDiv.className += ' text-green-600';
            form.reset();
            document.getElementById('recipe-items-container').innerHTML = ''; // Clear dynamic fields
            document.getElementById('modifier-groups-container').innerHTML = '';
            currentEditProductId = null; // Reset edit mode
            document.getElementById('product-id').value = ''; // Clear hidden ID
            renderProductList();
            renderAddProductForm(); // Re-render form in add mode
        } else {
            feedbackDiv.textContent = `Failed to ${currentEditProductId ? 'update' : 'add'} product. Check console for errors or duplicate name/SKU.`;
            feedbackDiv.className += ' text-red-600';
        }
    }

    /**
     * Renders the list of products.
     */
    function renderProductList() {
        const container = document.getElementById(productListContainerId);
        if (!container) return;
        container.innerHTML = '<h3 class="text-lg font-medium mb-2">Product List</h3>';

        const products = ProductService.listProducts();
        if (products.length === 0) {
            container.innerHTML += '<p class="text-gray-500">No products defined yet.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'space-y-3';
        products.forEach(product => {
            const li = document.createElement('li');
            li.className = 'p-3 bg-white shadow rounded-md border border-gray-200';
            // Simple display for now, details can be expanded
            li.innerHTML = `
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <strong class="text-purple-600">${product.name}</strong> (${product.category})
                        <p class="text-sm text-gray-600">Price: $${product.basePrice.toFixed(2)} | Cost: $${product.baseCost.toFixed(2)} ${product.sku ? `| SKU: ${product.sku}` : ''}</p>
                        <p class="text-xs text-gray-500">Recipe Items: ${product.recipe.length} | Modifier Groups: ${product.modifierGroups.length}</p>
                    </div>
                    <div class="mt-2 sm:mt-0 flex space-x-2">
                        <button data-id="${product.id}" class="edit-product-btn text-xs px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                        <button data-id="${product.id}" class="remove-product-btn text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
                    </div>
                </div>
            `;
            ul.appendChild(li);
        });
        container.appendChild(ul);

        container.querySelectorAll('.edit-product-btn').forEach(btn => btn.addEventListener('click', handleEditProduct));
        container.querySelectorAll('.remove-product-btn').forEach(btn => btn.addEventListener('click', handleRemoveProduct));
    }

    function handleEditProduct(event) {
        const productId = event.target.dataset.id;
        const product = ProductService.getProduct(productId);
        if (product) {
            // Scroll to form for better UX
            document.getElementById(addProductFormContainerId).scrollIntoView({ behavior: 'smooth' });
            renderAddProductForm(product); // Re-render form with product data for editing
        } else {
            alert("Product not found for editing.");
        }
    }

    function handleRemoveProduct(event) {
        const productId = event.target.dataset.id;
        const product = ProductService.getProduct(productId);
        if (!product) {
            alert("Product not found.");
            return;
        }
        if (confirm(`Are you sure you want to remove product "${product.name}"?`)) {
            const success = ProductService.removeProduct(productId);
            if (success) {
                alert("Product removed.");
                renderProductList();
                // If the removed product was being edited, reset the form
                if (currentEditProductId === productId) {
                    currentEditProductId = null;
                    renderAddProductForm();
                }
            } else {
                alert("Failed to remove product.");
            }
        }
    }

    /**
     * Initializes the Products UI.
     */
    function initProductsUI() {
        loadIngredientsCache(); // Load ingredients once for all selectors
        renderAddProductForm(); // Initial render in 'add' mode
        renderProductList();
    }

    return {
        initProductsUI
    };
})();

// app.js will call ProductsUI.initProductsUI()
