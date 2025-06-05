/**
 * POS UI Management
 * Handles rendering and interactions for the Point of Sale interface.
 */
const PosUI = (function() {
    const productDisplayContainerId = 'pos-menu-display-container';
    const currentOrderContainerId = 'current-order-container';
    const modifierModalId = 'pos-modifier-modal'; // Will create this dynamically for now

    let activeProductForModifiers = null; // Store product when modifier modal is active

    /**
     * Renders the product selection area.
     */
    function renderProductSelectionArea() {
        const container = document.getElementById(productDisplayContainerId);
        if (!container) {
            console.error("Product display container not found.");
            return;
        }
        container.innerHTML = '<h3 class="text-lg font-semibold mb-2">Select Products</h3>';

        const products = ProductService.listProducts();
        if (products.length === 0) {
            container.innerHTML += '<p class="text-gray-500">No products available.</p>';
            return;
        }

        const productGrid = document.createElement('div');
        productGrid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'p-3 bg-white shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow border border-gray-200';
            card.innerHTML = `
                <h4 class="font-medium text-blue-600">${product.name}</h4>
                <p class="text-sm text-gray-700">$${product.basePrice.toFixed(2)}</p>
                <button data-product-id="${product.id}" class="add-to-order-btn mt-2 w-full text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Add to Order</button>
            `;
            productGrid.appendChild(card);
        });
        container.appendChild(productGrid);
    }

    /**
     * Renders the modal for selecting modifiers for a product.
     * @param {Product} product - The product for which to select modifiers.
     */
    function renderModifierSelectionModal(product) {
        activeProductForModifiers = product;
        let modal = document.getElementById(modifierModalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modifierModalId;
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 hidden z-50'; // Initially hidden
            document.body.appendChild(modal);
        }

        let optionsHtml = '';
        product.modifierGroups.forEach(group => {
            optionsHtml += `<fieldset class="mb-3 p-2 border rounded border-gray-300">
                <legend class="text-md font-semibold text-gray-700 px-1">${group.name}</legend>`;
            group.options.forEach(option => {
                // Assuming multiple selections per group are allowed via checkboxes
                // For single selection, input type would be "radio" and name attribute would be group.id
                optionsHtml += `
                    <div class="flex items-center my-1">
                        <input type="checkbox" id="mod-opt-${option.id}" name="${group.id}" value="${option.id}" data-group-id="${group.id}" data-option-id="${option.id}" class="modifier-option-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <label for="mod-opt-${option.id}" class="ml-2 block text-sm text-gray-900">
                            ${option.name} (+ $${option.additionalPrice.toFixed(2)})
                        </label>
                    </div>`;
            });
            optionsHtml += `</fieldset>`;
        });

        modal.innerHTML = `
            <div class="bg-white p-5 rounded-lg shadow-xl max-w-md w-full">
                <h3 class="text-lg font-semibold mb-3">Select Modifiers for ${product.name}</h3>
                <div id="modifier-options-form" class="max-h-60 overflow-y-auto mb-3">
                    ${optionsHtml}
                </div>
                <div class="flex justify-end space-x-2">
                    <button id="cancel-modifier-selection" class="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button id="confirm-modifier-selection" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Confirm Add</button>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');

        document.getElementById('confirm-modifier-selection').addEventListener('click', handleConfirmModifiers);
        document.getElementById('cancel-modifier-selection').addEventListener('click', hideModifierModal);
    }

    function hideModifierModal() {
        const modal = document.getElementById(modifierModalId);
        if (modal) modal.classList.add('hidden');
        activeProductForModifiers = null;
    }

    /**
     * Handles confirming modifier selections and adding item to order.
     */
    function handleConfirmModifiers() {
        if (!activeProductForModifiers) return;

        const chosenModifiersData = [];
        document.querySelectorAll(`#${modifierModalId} .modifier-option-checkbox:checked`).forEach(checkbox => {
            chosenModifiersData.push({
                modifierGroupId: checkbox.dataset.groupId,
                optionId: checkbox.value
            });
        });

        SalesService.addItemToOrder(activeProductForModifiers.id, 1, chosenModifiersData);
        renderCurrentOrder();
        hideModifierModal();
        // alert(`${activeProductForModifiers.name} added to order.`);
    }

    /**
     * Handles clicks on product cards (delegated).
     */
    function handleProductSelection(event) {
        const addButton = event.target.closest('.add-to-order-btn');
        if (addButton) {
            const productId = addButton.dataset.productId;
            const product = ProductService.getProduct(productId);
            if (product) {
                if (product.modifierGroups && product.modifierGroups.length > 0) {
                    renderModifierSelectionModal(product);
                } else {
                    SalesService.addItemToOrder(productId, 1, []);
                    renderCurrentOrder();
                    // alert(`${product.name} added to order.`);
                }
            }
        }
    }

    /**
     * Renders the current order details.
     */
    function renderCurrentOrder() {
        const container = document.getElementById(currentOrderContainerId);
        if (!container) {
            console.error("Current order container not found.");
            return;
        }

        const order = SalesService.getCurrentOrder();
        let itemsHtml = '<p class="text-gray-500">Order is empty.</p>';

        if (order.items.length > 0) {
            itemsHtml = order.items.map((item, index) => `
                <div class="py-2 border-b border-gray-200" data-order-item-id="${item.id}">
                    <div class="flex justify-between items-center">
                        <span class="font-medium">${item.productName}</span>
                        <span class="font-semibold">$${item.totalItemPrice.toFixed(2)}</span>
                    </div>
                    <div class="text-xs text-gray-600">
                        ${item.chosenModifiers.map(m => `+ ${m.optionName}`).join(', ') || '<em>No modifiers</em>'}
                    </div>
                    <div class="flex items-center mt-1">
                        <label for="qty-${item.id}" class="text-xs mr-1">Qty:</label>
                        <input type="number" id="qty-${item.id}" value="${item.quantity}" min="0" class="order-item-qty-input w-16 px-2 py-1 border border-gray-300 rounded text-sm" data-item-id="${item.id}">
                        <button data-item-id="${item.id}" class="remove-order-item-btn ml-2 text-xs px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500">&times; Remove</button>
                    </div>
                </div>
            `).join('');
        }

        container.innerHTML = `
            <h3 class="text-lg font-semibold mb-2 border-b pb-1">Current Order #${order.id ? order.id.split('_')[1] : 'N/A'}</h3>
            <div id="order-items-list" class="max-h-60 overflow-y-auto mb-3 pr-1">${itemsHtml}</div>
            <div class="text-sm space-y-1 border-t pt-2">
                <div class="flex justify-between"><span>Subtotal:</span><span>$${order.subtotal.toFixed(2)}</span></div>
                <div class="flex justify-between items-center">
                    <label for="order-discount" class="mr-1">Discount:</label>
                    <input type="number" id="order-discount" value="${order.discount.toFixed(2)}" step="0.01" min="0" class="w-20 px-2 py-1 border rounded text-sm">
                    <button id="apply-discount-btn" class="ml-1 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Apply</button>
                </div>
                <div class="flex justify-between font-bold text-lg"><span>Total:</span><span>$${order.total.toFixed(2)}</span></div>
            </div>
            <div class="mt-3 border-t pt-2">
                <h4 class="text-sm font-medium mb-1">Payment Method:</h4>
                <div class="flex space-x-3 text-sm">
                    <label><input type="radio" name="payment-method" value="cash" checked class="mr-1">Cash</label>
                    <label><input type="radio" name="payment-method" value="card" class="mr-1">Card</label>
                    <label><input type="radio" name="payment-method" value="ewallet" class="mr-1">eWallet</label>
                </div>
            </div>
            <button id="finalize-sale-btn" class="mt-4 w-full py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-50" ${order.items.length === 0 ? 'disabled' : ''}>
                Finalize Sale
            </button>
            <div id="pos-feedback" class="mt-2 text-sm"></div>
        `;

        // Attach event listeners for order items and actions
        document.getElementById('order-items-list').addEventListener('change', handleOrderItemQuantityChange);
        document.getElementById('order-items-list').addEventListener('click', handleRemoveOrderItemClick);
        document.getElementById('apply-discount-btn').addEventListener('click', handleApplyDiscount);
        document.getElementById('finalize-sale-btn').addEventListener('click', handleFinalizeSale);
    }

    function handleOrderItemQuantityChange(event) {
        if (event.target.classList.contains('order-item-qty-input')) {
            const itemId = event.target.dataset.itemId;
            const newQuantity = parseInt(event.target.value);
            if (!isNaN(newQuantity)) { // newQuantity can be 0 to remove
                SalesService.updateItemQuantityInOrder(itemId, newQuantity);
                renderCurrentOrder();
            }
        }
    }

    function handleRemoveOrderItemClick(event) {
        if (event.target.classList.contains('remove-order-item-btn')) {
            const itemId = event.target.dataset.itemId;
            SalesService.removeItemFromOrder(itemId);
            renderCurrentOrder();
        }
    }

    function handleApplyDiscount() {
        const discountInput = document.getElementById('order-discount');
        const discountAmount = parseFloat(discountInput.value);
        if (!isNaN(discountAmount) && discountAmount >= 0) {
            SalesService.applyDiscount(discountAmount);
            renderCurrentOrder();
        } else {
            alert("Please enter a valid discount amount.");
        }
    }

    function handleFinalizeSale() {
        const feedbackDiv = document.getElementById('pos-feedback');
        feedbackDiv.textContent = '';
        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!selectedPaymentMethod) {
            feedbackDiv.textContent = "Please select a payment method.";
            feedbackDiv.className = 'mt-2 text-sm text-red-600';
            return;
        }

        const paymentMethod = selectedPaymentMethod.value;
        const result = SalesService.finalizeSale(paymentMethod);

        if (result) {
            feedbackDiv.textContent = `Sale Complete! Transaction ID: ${result.id}. Total: $${result.total.toFixed(2)}`;
            feedbackDiv.className = 'mt-2 text-sm text-green-600';
            renderCurrentOrder(); // Will show an empty order
            renderProductSelectionArea(); // Refresh product display (in case stock indicators are added later)
            // Notify app.js or directly call IngredientsUI to refresh low stock alerts if needed
            if (typeof IngredientsUI !== 'undefined' && IngredientsUI.renderLowStockAlerts) {
                IngredientsUI.renderLowStockAlerts();
            }
        } else {
            // SalesService should ideally provide a more specific error message
            feedbackDiv.textContent = "Sale failed. Possible reasons: empty order, or inventory issue (check console).";
            feedbackDiv.className = 'mt-2 text-sm text-red-600';
        }
    }

    /**
     * Initializes the POS UI components.
     */
    function initPosUI() {
        const productContainer = document.getElementById(productDisplayContainerId);
        if (productContainer) {
            productContainer.addEventListener('click', handleProductSelection);
        }

        // Initial render
        renderProductSelectionArea();
        renderCurrentOrder();

        // Modifier modal needs to be in DOM or added dynamically.
        // If added dynamically, ensure event listeners for its internal buttons are set up when it's shown.
        // The current renderModifierSelectionModal handles this.
    }

    return {
        initPosUI,
        renderCurrentOrder, // Expose for potential external refresh
        renderProductSelectionArea // Expose for potential external refresh
    };

})();

// app.js will call PosUI.initPosUI()
