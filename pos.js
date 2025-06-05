// Data structure for the POS system
        let menuItems = [];
        let ingredients = [];
        let currentOrder = [];
        let orderNumber = 1001;
        let currentEditingItem = null;
        let currentRestockIngredientId = null; // For the restock modal
        let selectedPaymentMethod = 'cash'; // Default payment method
        let transactionHistory = [];
        let historyPage = 1;
        const HISTORY_PER_PAGE = 10;

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            loadData();
            initApp();
        });

        // Load data from localStorage
        function loadData() {
            // Load menu items
            try {
                const savedMenuItems = localStorage.getItem('coffeeHavenMenuItems');
                if (savedMenuItems) {
                    menuItems = JSON.parse(savedMenuItems);
                } else {
                    // Default menu items if none saved
                    menuItems = [
                        {
                            id: 1,
                            name: "Espresso",
                            category: "coffee",
                            price: 3.50,
                            stock: 50,
                            alert: 10,
                            ingredients: [
                                { name: "Coffee Beans", quantity: 10 }, // 10g per serving
                                { name: "Water", quantity: 200 }       // 200ml per serving
                            ]
                        },
                        {
                            id: 2,
                            name: "Americano",
                            category: "coffee",
                            price: 4.00,
                            stock: 45,
                            alert: 10,
                            ingredients: [
                                { name: "Coffee Beans", quantity: 10 },
                                { name: "Water", quantity: 300 }
                            ]
                        },
                        {
                            id: 3,
                            name: "Cappuccino",
                            category: "coffee",
                            price: 4.50,
                            stock: 40,
                            alert: 10,
                            ingredients: [
                                { name: "Coffee Beans", quantity: 10 },
                                { name: "Milk", quantity: 150 },
                                { name: "Water", quantity: 100 }
                            ]
                        },
                        {
                            id: 4,
                            name: "Latte",
                            category: "coffee",
                            price: 4.75,
                            stock: 38,
                            alert: 10,
                            ingredients: [
                                { name: "Coffee Beans", quantity: 10 },
                                { name: "Milk", quantity: 200 },
                                { name: "Water", quantity: 50 }
                            ]
                        },
                        {
                            id: 5,
                            name: "Mocha",
                            category: "coffee",
                            price: 5.00,
                            stock: 35,
                            alert: 10,
                            ingredients: [
                                { name: "Coffee Beans", quantity: 10 },
                                { name: "Milk", quantity: 150 },
                                { name: "Chocolate Syrup", quantity: 30 },
                                { name: "Water", quantity: 50 }
                            ]
                        },
                        {
                            id: 6,
                            name: "Green Tea",
                            category: "tea",
                            price: 3.00,
                            stock: 30,
                            alert: 5,
                            ingredients: [
                                { name: "Green Tea Leaves", quantity: 5 },
                                { name: "Water", quantity: 250 }
                            ]
                        },
                        {
                            id: 7,
                            name: "Black Tea",
                            category: "tea",
                            price: 3.00,
                            stock: 30,
                            alert: 5,
                            ingredients: [
                                { name: "Black Tea Leaves", quantity: 5 },
                                { name: "Water", quantity: 250 }
                            ]
                        },
                        {
                            id: 8,
                            name: "Chai Latte",
                            category: "tea",
                            price: 4.50,
                            stock: 25,
                            alert: 5,
                            ingredients: [
                                { name: "Chai Tea Mix", quantity: 15 },
                                { name: "Milk", quantity: 200 }
                            ]
                        },
                        {
                            id: 9,
                            name: "Croissant",
                            category: "food",
                            price: 3.50,
                            stock: 20,
                            alert: 5,
                            ingredients: [
                                { name: "Croissant", quantity: 1 }
                            ]
                        },
                        {
                            id: 10,
                            name: "Blueberry Muffin",
                            category: "food",
                            price: 3.75,
                            stock: 18,
                            alert: 5,
                            ingredients: [
                                { name: "Blueberry Muffin", quantity: 1 }
                            ]
                        },
                        {
                            id: 11,
                            name: "Bagel",
                            category: "food",
                            price: 3.00,
                            stock: 15,
                            alert: 5,
                            ingredients: [
                                { name: "Bagel", quantity: 1 }
                            ]
                        },
                        {
                            id: 12,
                            name: "Sandwich",
                            category: "food",
                            price: 6.50,
                            stock: 12,
                            alert: 5,
                            ingredients: [
                                { name: "Bread", quantity: 2 },
                                { name: "Cheese", quantity: 30 },
                                { name: "Ham", quantity: 50 },
                                { name: "Lettuce", quantity: 10 },
                                { name: "Tomato", quantity: 20 }
                            ]
                        }
                    ];
                    saveMenuItems(); // Attempt to save defaults if nothing was loaded
                }
            } catch (e) {
                console.error("Error reading 'coffeeHavenMenuItems' from localStorage:", e);
                // Fallback to default menu items if error during load
                menuItems = [
                    {
                        id: 1,
                        name: "Espresso",
                        category: "coffee",
                        price: 3.50,
                        stock: 50,
                        alert: 10,
                        ingredients: [
                            { name: "Coffee Beans", quantity: 10 }, // 10g per serving
                            { name: "Water", quantity: 200 }       // 200ml per serving
                        ]
                    },
                    {
                        id: 2,
                        name: "Americano",
                        category: "coffee",
                        price: 4.00,
                        stock: 45,
                        alert: 10,
                        ingredients: [
                            { name: "Coffee Beans", quantity: 10 },
                            { name: "Water", quantity: 300 }
                        ]
                    },
                    {
                        id: 3,
                        name: "Cappuccino",
                        category: "coffee",
                        price: 4.50,
                        stock: 40,
                        alert: 10,
                        ingredients: [
                            { name: "Coffee Beans", quantity: 10 },
                            { name: "Milk", quantity: 150 },
                            { name: "Water", quantity: 100 }
                        ]
                    },
                    {
                        id: 4,
                        name: "Latte",
                        category: "coffee",
                        price: 4.75,
                        stock: 38,
                        alert: 10,
                        ingredients: [
                            { name: "Coffee Beans", quantity: 10 },
                            { name: "Milk", quantity: 200 },
                            { name: "Water", quantity: 50 }
                        ]
                    },
                    {
                        id: 5,
                        name: "Mocha",
                        category: "coffee",
                        price: 5.00,
                        stock: 35,
                        alert: 10,
                        ingredients: [
                            { name: "Coffee Beans", quantity: 10 },
                            { name: "Milk", quantity: 150 },
                            { name: "Chocolate Syrup", quantity: 30 },
                            { name: "Water", quantity: 50 }
                        ]
                    },
                    {
                        id: 6,
                        name: "Green Tea",
                        category: "tea",
                        price: 3.00,
                        stock: 30,
                        alert: 5,
                        ingredients: [
                            { name: "Green Tea Leaves", quantity: 5 },
                            { name: "Water", quantity: 250 }
                        ]
                    },
                    {
                        id: 7,
                        name: "Black Tea",
                        category: "tea",
                        price: 3.00,
                        stock: 30,
                        alert: 5,
                        ingredients: [
                            { name: "Black Tea Leaves", quantity: 5 },
                            { name: "Water", quantity: 250 }
                        ]
                    },
                    {
                        id: 8,
                        name: "Chai Latte",
                        category: "tea",
                        price: 4.50,
                        stock: 25,
                        alert: 5,
                        ingredients: [
                            { name: "Chai Tea Mix", quantity: 15 },
                            { name: "Milk", quantity: 200 }
                        ]
                    },
                    {
                        id: 9,
                        name: "Croissant",
                        category: "food",
                        price: 3.50,
                        stock: 20,
                        alert: 5,
                        ingredients: [
                            { name: "Croissant", quantity: 1 }
                        ]
                    },
                    {
                        id: 10,
                        name: "Blueberry Muffin",
                        category: "food",
                        price: 3.75,
                        stock: 18,
                        alert: 5,
                        ingredients: [
                            { name: "Blueberry Muffin", quantity: 1 }
                        ]
                    },
                    {
                        id: 11,
                        name: "Bagel",
                        category: "food",
                        price: 3.00,
                        stock: 15,
                        alert: 5,
                        ingredients: [
                            { name: "Bagel", quantity: 1 }
                        ]
                    },
                    {
                        id: 12,
                        name: "Sandwich",
                        category: "food",
                        price: 6.50,
                        stock: 12,
                        alert: 5,
                        ingredients: [
                            { name: "Bread", quantity: 2 },
                            { name: "Cheese", quantity: 30 },
                            { name: "Ham", quantity: 50 },
                            { name: "Lettuce", quantity: 10 },
                            { name: "Tomato", quantity: 20 }
                        ]
                    }
                ];
                menuItems = [ // Ensure menuItems has a default value even if saveMenuItems fails or wasn't called due to error above
                    { id: 1, name: "Espresso", category: "coffee", price: 3.50, stock: 50, alert: 10, ingredients: [{ name: "Coffee Beans", quantity: 10 }, { name: "Water", quantity: 200 }] },
                    { id: 2, name: "Americano", category: "coffee", price: 4.00, stock: 45, alert: 10, ingredients: [{ name: "Coffee Beans", quantity: 10 }, { name: "Water", quantity: 300 }] },
                    // Add other default items as initially defined to ensure app stability
                ];
            }

            // Load ingredients
            try {
                const savedIngredients = localStorage.getItem('coffeeHavenIngredients');
                if (savedIngredients) {
                    ingredients = JSON.parse(savedIngredients);
                } else {
                    // Default ingredients if none saved
                    ingredients = [
                        { id: 1, name: "Coffee Beans", stock: 1000, alert: 200, unit: "g" },
                        { id: 2, name: "Milk", stock: 5000, alert: 1000, unit: "ml" },
                        { id: 3, name: "Water", stock: 10000, alert: 2000, unit: "ml" },
                        { id: 4, name: "Chocolate Syrup", stock: 500, alert: 100, unit: "ml" },
                        { id: 5, name: "Green Tea Leaves", stock: 200, alert: 50, unit: "g" },
                        { id: 6, name: "Black Tea Leaves", stock: 200, alert: 50, unit: "g" },
                        { id: 7, name: "Chai Tea Mix", stock: 300, alert: 75, unit: "g" },
                        { id: 8, name: "Croissant", stock: 20, alert: 5, unit: "each" },
                        { id: 9, name: "Blueberry Muffin", stock: 18, alert: 5, unit: "each" },
                        { id: 10, name: "Bagel", stock: 15, alert: 5, unit: "each" },
                        { id: 11, name: "Bread", stock: 30, alert: 10, unit: "slices" },
                        { id: 12, name: "Cheese", stock: 1000, alert: 200, unit: "g" },
                        { id: 13, name: "Ham", stock: 800, alert: 200, unit: "g" },
                        { id: 14, name: "Lettuce", stock: 500, alert: 100, unit: "g" },
                        { id: 15, name: "Tomato", stock: 600, alert: 150, unit: "g" }
                    ];
                    saveIngredients(); // Attempt to save defaults
                }
            } catch (e) {
                console.error("Error reading 'coffeeHavenIngredients' from localStorage:", e);
                // Fallback to default ingredients
                ingredients = [
                    { id: 1, name: "Coffee Beans", stock: 1000, alert: 200, unit: "g" },
                    { id: 2, name: "Milk", stock: 5000, alert: 1000, unit: "ml" },
                    { id: 3, name: "Water", stock: 10000, alert: 2000, unit: "ml" },
                    { id: 4, name: "Chocolate Syrup", stock: 500, alert: 100, unit: "ml" },
                    { id: 5, name: "Green Tea Leaves", stock: 200, alert: 50, unit: "g" },
                    { id: 6, name: "Black Tea Leaves", stock: 200, alert: 50, unit: "g" },
                    { id: 7, name: "Chai Tea Mix", stock: 300, alert: 75, unit: "g" },
                    { id: 8, name: "Croissant", stock: 20, alert: 5, unit: "each" },
                    { id: 9, name: "Blueberry Muffin", stock: 18, alert: 5, unit: "each" },
                    { id: 10, name: "Bagel", stock: 15, alert: 5, unit: "each" },
                    { id: 11, name: "Bread", stock: 30, alert: 10, unit: "slices" },
                    { id: 12, name: "Cheese", stock: 1000, alert: 200, unit: "g" },
                    { id: 13, name: "Ham", stock: 800, alert: 200, unit: "g" },
                    { id: 14, name: "Lettuce", stock: 500, alert: 100, unit: "g" },
                    { id: 15, name: "Tomato", stock: 600, alert: 150, unit: "g" }
                ];
                ingredients = [ // Ensure ingredients has a default value
                    { id: 1, name: "Coffee Beans", stock: 1000, alert: 200, unit: "g" },
                    // Add other default ingredients
                ];
            }

            // Load current order
            try {
                const savedOrder = localStorage.getItem('coffeeHavenCurrentOrder');
                if (savedOrder) {
                    currentOrder = JSON.parse(savedOrder);
                }
            } catch (e) {
                console.error("Error reading 'coffeeHavenCurrentOrder' from localStorage:", e);
                currentOrder = []; // Default to empty order
            }

            // Load transaction history
            try {
                const savedHistory = localStorage.getItem('coffeeHavenTransactionHistory');
                if (savedHistory) {
                    transactionHistory = JSON.parse(savedHistory);
                }
            } catch (e) {
                console.error("Error reading 'coffeeHavenTransactionHistory' from localStorage:", e);
                transactionHistory = []; // Default to empty history
            }

            // Load order number
            try {
                const savedOrderNumber = localStorage.getItem('coffeeHavenOrderNumber');
                if (savedOrderNumber) {
                    orderNumber = parseInt(savedOrderNumber);
                }
            } catch (e) {
                console.error("Error reading 'coffeeHavenOrderNumber' from localStorage:", e);
                orderNumber = 1001; // Default order number
            }

            // Load settings
            try {
                const savedSettings = localStorage.getItem('coffeeHavenSettings');
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    selectedPaymentMethod = settings.selectedPaymentMethod || 'cash';
                }
            } catch (e) {
                console.error("Error reading 'coffeeHavenSettings' from localStorage:", e);
                selectedPaymentMethod = 'cash'; // Default payment method
            }
        }

        // Save data to localStorage
        function saveMenuItems() {
            try {
                localStorage.setItem('coffeeHavenMenuItems', JSON.stringify(menuItems));
            } catch (e) {
                console.error("Error writing 'coffeeHavenMenuItems' to localStorage:", e);
            }
        }

        function saveIngredients() {
            try {
                localStorage.setItem('coffeeHavenIngredients', JSON.stringify(ingredients));
            } catch (e) {
                console.error("Error writing 'coffeeHavenIngredients' to localStorage:", e);
            }
        }

        function saveCurrentOrder() {
            try {
                localStorage.setItem('coffeeHavenCurrentOrder', JSON.stringify(currentOrder));
            } catch (e) {
                console.error("Error writing 'coffeeHavenCurrentOrder' to localStorage:", e);
            }
        }

        function saveTransactionHistory() {
            try {
                localStorage.setItem('coffeeHavenTransactionHistory', JSON.stringify(transactionHistory));
            } catch (e) {
                console.error("Error writing 'coffeeHavenTransactionHistory' to localStorage:", e);
            }
        }

        function saveOrderNumber() {
            try {
                localStorage.setItem('coffeeHavenOrderNumber', orderNumber.toString());
            } catch (e) {
                console.error("Error writing 'coffeeHavenOrderNumber' to localStorage:", e);
            }
        }

        function saveSettings() {
            try {
                const settings = {
                    selectedPaymentMethod: selectedPaymentMethod
                };
                localStorage.setItem('coffeeHavenSettings', JSON.stringify(settings));
            } catch (e) {
                console.error("Error writing 'coffeeHavenSettings' to localStorage:", e);
            }
        }

        function initApp() {
            updateCurrentTime();
            setInterval(updateCurrentTime, 60000); // Update time every minute

            renderMenuItems();
            renderOrderItems();
            updateOrderSummary();
            renderReceipt();
            renderInventoryItems();
            renderIngredients();
            updateInventorySummary();
            renderHistoryItems();

            // Initialize payment method selection
            setupPaymentMethods();

            // Event listeners for static elements
            document.getElementById('checkout-btn').addEventListener('click', checkoutOrder);
            document.getElementById('clear-order').addEventListener('click', clearOrder);
            document.getElementById('inventory-btn').addEventListener('click', showInventoryPanel);
            document.getElementById('close-inventory').addEventListener('click', showReceiptPanel);
            document.getElementById('add-inventory-item').addEventListener('click', showAddItemModal);
            document.getElementById('print-receipt').addEventListener('click', printReceipt);
            document.getElementById('menu-search').addEventListener('input', filterMenuItems);
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', filterByCategory);
            });
            document.getElementById('close-modal').addEventListener('click', closeModal);
            document.getElementById('cancel-modal').addEventListener('click', closeModal);
            document.getElementById('save-item').addEventListener('click', saveInventoryItem);
            document.getElementById('refresh-history').addEventListener('click', renderHistoryItems);
            document.getElementById('prev-history').addEventListener('click', prevHistoryPage);
            document.getElementById('next-history').addEventListener('click', nextHistoryPage);
            document.getElementById('close-receipt-modal').addEventListener('click', closeReceiptModal);
            document.getElementById('close-receipt-modal-btn').addEventListener('click', closeReceiptModal);
            document.getElementById('print-modal-receipt').addEventListener('click', printModalReceipt);
            document.getElementById('add-ingredient-btn').addEventListener('click', addIngredientField);

            // Restock Modal Listeners
            document.getElementById('save-restock-amount').addEventListener('click', saveRestockAmount);
            document.getElementById('cancel-restock-modal').addEventListener('click', closeRestockModal);
            document.getElementById('close-restock-modal-icon').addEventListener('click', closeRestockModal);

            // Tab switching
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.addEventListener('click', switchTab);
            });
        }

        // Add ingredient field to modal
        function addIngredientField(ingredient = { name: '', quantity: '' }) {
            const container = document.getElementById('ingredients-container');
            const ingredientId = Date.now(); // Unique ID for each ingredient field

            const ingredientDiv = document.createElement('div');
            ingredientDiv.className = 'flex items-center space-x-2';
            ingredientDiv.dataset.id = ingredientId;

            ingredientDiv.innerHTML = `
                <select class="ingredient-name flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Ingredient</option>
                    ${ingredients.map(ing =>
                        `<option value="${ing.name}" ${ing.name === ingredient.name ? 'selected' : ''}>${ing.name}</option>`
                    ).join('')}
                </select>
                <input type="number" class="ingredient-quantity w-20 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Qty" value="${ingredient.quantity || ''}">
                <button type="button" class="remove-ingredient px-2 text-red-600 hover:text-red-800">
                    <i class="fas fa-times"></i>
                </button>
            `;

            container.appendChild(ingredientDiv);

            // Add event listener for remove button
            ingredientDiv.querySelector('.remove-ingredient').addEventListener('click', function() {
                container.removeChild(ingredientDiv);
            });
        }

        // Switch between tabs
        function switchTab(e) {
            const tab = e.target.dataset.tab;

            // Update active tab button
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            // Show the selected tab
            if (tab === 'receipt') {
                document.getElementById('receipt-panel').classList.remove('hidden');
                document.getElementById('history-panel').classList.add('hidden');
            } else if (tab === 'history') {
                document.getElementById('receipt-panel').classList.add('hidden');
                document.getElementById('history-panel').classList.remove('hidden');
            }
        }

        // Set up payment method selection
        function setupPaymentMethods() {
            const paymentMethods = document.querySelectorAll('.payment-method');

            // Set initial selected state
            document.querySelector(`.payment-method[data-method="${selectedPaymentMethod}"]`).classList.add('selected');

            paymentMethods.forEach(method => {
                method.addEventListener('click', function() {
                    // Remove selected class from all methods
                    paymentMethods.forEach(m => m.classList.remove('selected'));

                    // Add selected class to clicked method
                    this.classList.add('selected');

                    // Update selected payment method
                    selectedPaymentMethod = this.dataset.method;
                    saveSettings();

                    // Update receipt preview
                    document.getElementById('receipt-payment-method').textContent =
                        selectedPaymentMethod === 'cash' ? 'Cash' :
                        selectedPaymentMethod === 'card' ? 'Credit/Debit Card' :
                        'GCash/Maya';
                });
            });
        }

        // Update current time display
        function updateCurrentTime() {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            document.getElementById('current-time').textContent = now.toLocaleDateString('en-US', options);
        }

        // Render menu items
        function renderMenuItems(filter = 'all', searchTerm = '') {
            const menuItemsContainer = document.getElementById('menu-items');
            menuItemsContainer.innerHTML = '';

            let filteredItems = menuItems;

            // Filter by category
            if (filter !== 'all') {
                filteredItems = menuItems.filter(item => item.category === filter);
            }

            // Filter by search term
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredItems = filteredItems.filter(item =>
                    item.name.toLowerCase().includes(term) ||
                    item.category.toLowerCase().includes(term)
                );
            }

            // Render items
            filteredItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer';
                itemElement.dataset.id = item.id;

                // Add low stock warning if applicable
                const stockWarning = item.stock <= item.alert ?
                    `<span class="text-xs ${item.stock === 0 ? 'text-red-600' : 'text-yellow-600'} font-medium">
                        ${item.stock === 0 ? 'Out of stock' : 'Low stock'}
                    </span>` : '';

                itemElement.innerHTML = `
                    <div>
                        <div class="font-medium">${item.name}</div>
                        <div class="text-xs text-gray-500">${formatCategory(item.category)}</div>
                        ${stockWarning}
                    </div>
                    <div class="font-bold text-blue-700">$${item.price.toFixed(2)}</div>
                `;

                // Only allow adding if in stock
                if (item.stock > 0) {
                    itemElement.addEventListener('click', () => addToOrder(item.id));
                } else {
                    itemElement.classList.add('opacity-50');
                }

                menuItemsContainer.appendChild(itemElement);
            });

            // Show message if no items found
            if (filteredItems.length === 0) {
                const noItemsElement = document.createElement('div');
                noItemsElement.className = 'text-center py-4 text-gray-500';
                noItemsElement.textContent = 'No items found';
                menuItemsContainer.appendChild(noItemsElement);
            }
        }

        // Format category for display
        function formatCategory(category) {
            return category.charAt(0).toUpperCase() + category.slice(1);
        }

        // Add item to order
        function addToOrder(itemId) {
            const item = menuItems.find(i => i.id === itemId);

            if (!item) return;

            // Check if item already exists in order
            const existingItem = currentOrder.find(i => i.id === itemId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                currentOrder.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1
                });
            }

            // Save order
            saveCurrentOrder();

            // Update UI
            renderOrderItems();
            updateOrderSummary();
        }

        // Render order items
        function renderOrderItems() {
            const orderItemsContainer = document.getElementById('order-items');
            orderItemsContainer.innerHTML = '';

            if (currentOrder.length === 0) {
                const emptyElement = document.createElement('div');
                emptyElement.className = 'text-center py-4 text-gray-500';
                emptyElement.textContent = 'No items in order';
                orderItemsContainer.appendChild(emptyElement);
                return;
            }

            currentOrder.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'grid grid-cols-6 gap-1';

                itemElement.innerHTML = `
                    <div class="grid-cell flex items-center justify-center">
                        <button class="decrease-qty px-2 text-gray-500 hover:text-gray-700" data-index="${index}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="increase-qty px-2 text-gray-500 hover:text-gray-700" data-index="${index}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="grid-cell col-span-3">${item.name}</div>
                    <div class="grid-cell">$${item.price.toFixed(2)}</div>
                    <div class="grid-cell">$${(item.price * item.quantity).toFixed(2)}</div>
                `;

                orderItemsContainer.appendChild(itemElement);
            });

            // Add event listeners for quantity buttons
            document.querySelectorAll('.decrease-qty').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    decreaseQuantity(index);
                });
            });

            document.querySelectorAll('.increase-qty').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    increaseQuantity(index);
                });
            });
        }

        // Decrease item quantity
        function decreaseQuantity(index) {
            if (currentOrder[index].quantity > 1) {
                currentOrder[index].quantity -= 1;
            } else {
                currentOrder.splice(index, 1);
            }

            // Save order
            saveCurrentOrder();

            renderOrderItems();
            updateOrderSummary();
        }

        // Increase item quantity
        function increaseQuantity(index) {
            currentOrder[index].quantity += 1;

            // Save order
            saveCurrentOrder();

            renderOrderItems();
            updateOrderSummary();
        }

        // Update order summary (total only, no tax)
        function updateOrderSummary() {
            const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            document.getElementById('total').textContent = `$${total.toFixed(2)}`;

            // Update receipt preview
            document.getElementById('receipt-total').textContent = `$${total.toFixed(2)}`;

            renderReceiptItems();
        }

        // Render receipt items
        function renderReceiptItems() {
            const receiptItemsContainer = document.getElementById('receipt-items');
            receiptItemsContainer.innerHTML = '';

            currentOrder.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'flex justify-between mb-1';

                itemElement.innerHTML = `
                    <div>
                        <span>${item.quantity}x</span>
                        <span class="ml-2">${item.name}</span>
                    </div>
                    <div>$${(item.price * item.quantity).toFixed(2)}</div>
                `;

                receiptItemsContainer.appendChild(itemElement);
            });
        }

        // Clear current order
        function clearOrder() {
            currentOrder = [];

            // Save order
            saveCurrentOrder();

            renderOrderItems();
            updateOrderSummary();
        }

        // Deduct ingredients from inventory when an order is placed
        function deductIngredients(order) {
            order.forEach(orderItem => {
                const menuItem = menuItems.find(item => item.id === orderItem.id);
                if (menuItem && menuItem.ingredients) {
                    menuItem.ingredients.forEach(ingredient => {
                        const inventoryItem = ingredients.find(i => i.name === ingredient.name);
                        if (inventoryItem) {
                            inventoryItem.stock -= ingredient.quantity * orderItem.quantity;
                            if (inventoryItem.stock < 0) inventoryItem.stock = 0;
                        }
                    });
                }
            });

            // Save updated ingredients inventory
            saveIngredients();
            renderIngredients();
        }

        // Checkout order
        function checkoutOrder() {
            if (currentOrder.length === 0) {
                alert('Please add items to the order before checkout.');
                return;
            }

            // First check if we have enough ingredients
            let canProceed = true;
            let missingIngredients = [];

            currentOrder.forEach(orderItem => {
                const menuItem = menuItems.find(item => item.id === orderItem.id);
                if (menuItem && menuItem.ingredients) {
                    menuItem.ingredients.forEach(ingredient => {
                        const inventoryItem = ingredients.find(i => i.name === ingredient.name);
                        if (!inventoryItem || inventoryItem.stock < (ingredient.quantity * orderItem.quantity)) {
                            canProceed = false;
                            missingIngredients.push({
                                name: ingredient.name,
                                required: ingredient.quantity * orderItem.quantity,
                                available: inventoryItem ? inventoryItem.stock : 0
                            });
                        }
                    });
                }
            });

            if (!canProceed) {
                let alertMessage = "Not enough ingredients to complete this order:\n";
                missingIngredients.forEach(ing => {
                    alertMessage += `\n${ing.name}: Need ${ing.required}, have ${ing.available}`;
                });
                alert(alertMessage);
                return;
            }

            // Create transaction record
            const transaction = {
                id: orderNumber,
                date: new Date().toISOString(),
                items: [...currentOrder],
                paymentMethod: selectedPaymentMethod,
                total: currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };

            // Add to history
            transactionHistory.unshift(transaction); // Add to beginning of array
            saveTransactionHistory();

            // Update inventory (reduce stock)
            currentOrder.forEach(orderItem => {
                const menuItem = menuItems.find(item => item.id === orderItem.id);
                if (menuItem) {
                    menuItem.stock -= orderItem.quantity;
                    if (menuItem.stock < 0) menuItem.stock = 0;
                }
            });

            // Deduct ingredients
            deductIngredients(currentOrder);

            // Save updated inventory
            saveMenuItems();

            // Increment order number
            orderNumber++;
            saveOrderNumber();

            // Update UI
            renderMenuItems();
            renderInventoryItems();
            renderIngredients();
            updateInventorySummary();
            renderHistoryItems();

            // Set receipt details
            const now = new Date();
            document.getElementById('receipt-date').textContent = now.toLocaleString();
            document.getElementById('receipt-order-number').textContent = transaction.id;

            // Update payment method on receipt
            document.getElementById('receipt-payment-method').textContent =
                selectedPaymentMethod === 'cash' ? 'Cash' :
                selectedPaymentMethod === 'card' ? 'Credit/Debit Card' :
                'GCash/Maya';

            // Show receipt in print preview
            setTimeout(() => {
                document.getElementById('print-receipt').click();
            }, 500);

            // Clear order after checkout
            clearOrder();
        }

        // Print receipt
        function printReceipt() {
            const receiptContent = document.getElementById('receipt-content').innerHTML;
            const originalContent = document.body.innerHTML;

            document.body.innerHTML = `
                <div class="receipt p-4" style="width: 300px; margin: 0 auto;">
                    ${receiptContent}
                </div>
            `;

            window.print();
            document.body.innerHTML = originalContent;

            // Reinitialize the app after print
            initApp();
        }

        // Show inventory panel
        function showInventoryPanel() {
            document.getElementById('receipt-panel').classList.add('hidden');
            document.getElementById('history-panel').classList.add('hidden');
            document.getElementById('inventory-panel').classList.remove('hidden');
        }

        // Show receipt panel
        function showReceiptPanel() {
            document.getElementById('inventory-panel').classList.add('hidden');
            document.getElementById('history-panel').classList.add('hidden');
            document.getElementById('receipt-panel').classList.remove('hidden');

            // Set receipt tab as active
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector('.tab-button[data-tab="receipt"]').classList.add('active');
        }

        // Render inventory items
        function renderInventoryItems() {
            const inventoryItemsContainer = document.getElementById('inventory-items');
            inventoryItemsContainer.innerHTML = '';

            menuItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'grid grid-cols-8 gap-1';

                // Determine stock status
                let stockStatus = '';
                if (item.stock === 0) {
                    stockStatus = '<span class="text-red-600">Out of stock</span>';
                } else if (item.stock <= item.alert) {
                    stockStatus = '<span class="text-yellow-600">Low stock</span>';
                } else {
                    stockStatus = '<span class="text-green-600">In stock</span>';
                }

                itemElement.innerHTML = `
                    <div class="grid-cell">${item.id}</div>
                    <div class="grid-cell col-span-2">${item.name}</div>
                    <div class="grid-cell">${formatCategory(item.category)}</div>
                    <div class="grid-cell">$${item.price.toFixed(2)}</div>
                    <div class="grid-cell">${item.stock}</div>
                    <div class="grid-cell">${stockStatus}</div>
                    <div class="grid-cell flex space-x-1">
                        <button class="edit-item px-2 text-blue-600 hover:text-blue-800" data-id="${item.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-item px-2 text-red-600 hover:text-red-800" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;

                inventoryItemsContainer.appendChild(itemElement);
            });

            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemId = parseInt(this.dataset.id);
                    editInventoryItem(itemId);
                });
            });

            document.querySelectorAll('.delete-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemId = parseInt(this.dataset.id);
                    deleteInventoryItem(itemId);
                });
            });

            // Update low stock items
            updateLowStockItems();
        }

        // Render ingredients
        function renderIngredients() {
            const ingredientsContainer = document.getElementById('ingredients-items');
            ingredientsContainer.innerHTML = '';

            if (ingredients.length === 0) {
                const emptyElement = document.createElement('div');
                emptyElement.className = 'text-center py-4 text-gray-500';
                emptyElement.textContent = 'No ingredients in inventory';
                ingredientsContainer.appendChild(emptyElement);
                return;
            }

            ingredients.forEach(ingredient => {
                const ingredientElement = document.createElement('div');
                ingredientElement.className = 'grid grid-cols-4 gap-1';

                // Determine stock status
                let stockStatus = '';
                if (ingredient.stock === 0) {
                    stockStatus = '<span class="text-red-600">Out of stock</span>';
                } else if (ingredient.stock <= ingredient.alert) {
                    stockStatus = '<span class="text-yellow-600">Low stock</span>';
                } else {
                    stockStatus = '<span class="text-green-600">In stock</span>';
                }

                ingredientElement.innerHTML = `
                    <div class="grid-cell">${ingredient.name}</div>
                    <div class="grid-cell">${ingredient.stock} ${ingredient.unit}</div>
                    <div class="grid-cell">${stockStatus}</div>
                    <div class="grid-cell">
                        <button class="restock-btn px-2 text-blue-600 hover:text-blue-800" data-id="${ingredient.id}">
                            <i class="fas fa-plus"></i> Restock
                        </button>
                    </div>
                `;

                ingredientsContainer.appendChild(ingredientElement);
            });

            // Add event listeners for restock buttons
            document.querySelectorAll('.restock-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const ingredientId = parseInt(this.dataset.id);
                    restockIngredient(ingredientId);
                });
            });
        }

        // Restock ingredient
        function restockIngredient(ingredientId) {
            openRestockModal(ingredientId);
        }

        // Open Restock Modal
        function openRestockModal(ingredientId) {
            const ingredient = ingredients.find(i => i.id === ingredientId);
            if (!ingredient) return;

            currentRestockIngredientId = ingredientId;
            document.getElementById('restock-ingredient-name').textContent = ingredient.name;
            document.getElementById('restock-current-stock').textContent = ingredient.stock;
            document.getElementById('restock-ingredient-unit').textContent = ingredient.unit;
            document.getElementById('restock-amount').value = ''; // Clear previous input
            document.getElementById('restock-error-message').textContent = ''; // Clear error message
            document.getElementById('restock-modal').classList.remove('hidden');
            document.getElementById('restock-amount').focus();
        }

        // Close Restock Modal
        function closeRestockModal() {
            document.getElementById('restock-modal').classList.add('hidden');
            currentRestockIngredientId = null;
        }

        // Save Restock Amount
        function saveRestockAmount() {
            if (currentRestockIngredientId === null) return;

            const ingredient = ingredients.find(i => i.id === currentRestockIngredientId);
            if (!ingredient) return;

            const restockAmountInput = document.getElementById('restock-amount');
            const restockAmount = parseInt(restockAmountInput.value);
            const errorMessageElement = document.getElementById('restock-error-message');

            if (isNaN(restockAmount) || restockAmount <= 0) {
                errorMessageElement.textContent = 'Please enter a valid positive number.';
                restockAmountInput.focus();
                return;
            }

            errorMessageElement.textContent = ''; // Clear error message
            ingredient.stock += restockAmount;
            saveIngredients();
            renderIngredients(); // Re-render to show updated stock and potentially clear low stock warnings
            updateInventorySummary(); // This might also be relevant if ingredients affect menu item stock indirectly in future
            closeRestockModal();
        }

        // Update low stock items
        function updateLowStockItems() {
            const lowStockItems = menuItems.filter(item => item.stock <= item.alert);
            const lowStockItemsContainer = document.getElementById('low-stock-items');

            lowStockItemsContainer.innerHTML = '';

            if (lowStockItems.length === 0) {
                lowStockItemsContainer.innerHTML = '<p class="text-gray-500">No low stock items</p>';
                return;
            }

            lowStockItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'flex justify-between items-center mb-2';

                itemElement.innerHTML = `
                    <span>${item.name}</span>
                    <span class="font-medium ${item.stock === 0 ? 'text-red-600' : 'text-yellow-600'}">
                        ${item.stock} left (alert at ${item.alert})
                    </span>
                `;

                lowStockItemsContainer.appendChild(itemElement);
            });
        }

        // Update inventory summary
        function updateInventorySummary() {
            const totalItems = menuItems.length;
            const outOfStock = menuItems.filter(item => item.stock === 0).length;
            const lowStock = menuItems.filter(item => item.stock > 0 && item.stock <= item.alert).length;

            document.getElementById('total-items').textContent = totalItems;
            document.getElementById('out-of-stock').textContent = outOfStock;
            document.getElementById('low-stock').textContent = lowStock;
        }

        // Show add item modal
        function showAddItemModal() {
            currentEditingItem = null;
            document.getElementById('modal-title').textContent = 'Add Inventory Item';
            document.getElementById('inventory-form').reset();
            document.getElementById('item-id').value = '';
            document.getElementById('ingredients-container').innerHTML = '';
            document.getElementById('inventory-modal').classList.remove('hidden');
        }

        // Edit inventory item
        function editInventoryItem(itemId) {
            const item = menuItems.find(i => i.id === itemId);
            if (!item) return;

            currentEditingItem = item;
            document.getElementById('modal-title').textContent = 'Edit Inventory Item';

            // Fill form with item data
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-price').value = item.price;
            document.getElementById('item-cost').value = item.price * 0.7; // Sample cost calculation
            document.getElementById('item-stock').value = item.stock;
            document.getElementById('item-alert').value = item.alert;

            // Clear existing ingredient fields
            const ingredientsContainer = document.getElementById('ingredients-container');
            ingredientsContainer.innerHTML = '';

            // Add ingredient fields
            if (item.ingredients && item.ingredients.length > 0) {
                item.ingredients.forEach(ingredient => {
                    addIngredientField(ingredient);
                });
            }

            document.getElementById('inventory-modal').classList.remove('hidden');
        }

        // Close modal
        function closeModal() {
            document.getElementById('inventory-modal').classList.add('hidden');
        }

        // Save inventory item
        function saveInventoryItem() {
            const id = document.getElementById('item-id').value;
            const name = document.getElementById('item-name').value.trim();
            const category = document.getElementById('item-category').value;
            const price = parseFloat(document.getElementById('item-price').value);
            const cost = parseFloat(document.getElementById('item-cost').value);
            const stock = parseInt(document.getElementById('item-stock').value);
            const alert = parseInt(document.getElementById('item-alert').value);

            // Validate inputs
            if (!name || isNaN(price) || isNaN(stock) || isNaN(alert)) {
                alert('Please fill in all fields with valid values.');
                return;
            }

            // Get ingredients from form
            const ingredientsContainer = document.getElementById('ingredients-container');
            const ingredientFields = ingredientsContainer.querySelectorAll('.ingredient-name');
            const itemIngredients = [];

            ingredientFields.forEach(field => {
                const ingredientDiv = field.closest('[data-id]');
                const ingredientName = field.value;
                const quantityInput = ingredientDiv.querySelector('.ingredient-quantity');
                const quantity = parseFloat(quantityInput.value);

                if (ingredientName && !isNaN(quantity) && quantity > 0) {
                    itemIngredients.push({
                        name: ingredientName,
                        quantity: quantity
                    });
                }
            });

            if (currentEditingItem) {
                // Update existing item
                currentEditingItem.name = name;
                currentEditingItem.category = category;
                currentEditingItem.price = price;
                currentEditingItem.stock = stock;
                currentEditingItem.alert = alert;
                currentEditingItem.ingredients = itemIngredients;
            } else {
                // Add new item
                const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
                menuItems.push({
                    id: newId,
                    name,
                    category,
                    price,
                    stock,
                    alert,
                    ingredients: itemIngredients
                });
            }

            // Save inventory
            saveMenuItems();

            // Update UI
            renderMenuItems();
            renderInventoryItems();
            updateInventorySummary();
            closeModal();
        }

        // Delete inventory item
        function deleteInventoryItem(itemId) {
            if (confirm('Are you sure you want to delete this item?')) {
                menuItems = menuItems.filter(item => item.id !== itemId);

                // Save inventory
                saveMenuItems();

                renderMenuItems();
                renderInventoryItems();
                updateInventorySummary();
            }
        }

        // Filter menu items by category
        function filterByCategory(e) {
            const category = e.target.dataset.category;
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('bg-amber-200');
                btn.classList.add('bg-amber-100');
            });
            e.target.classList.remove('bg-amber-100');
            e.target.classList.add('bg-amber-200');
            renderMenuItems(category, document.getElementById('menu-search').value);
        }

        // Filter menu items by search term
        function filterMenuItems() {
            const searchTerm = document.getElementById('menu-search').value;
            const activeCategory = document.querySelector('.category-btn.bg-amber-200');
            const category = activeCategory ? activeCategory.dataset.category : 'all';
            renderMenuItems(category, searchTerm);
        }

        // Render receipt
        function renderReceipt() {
            const now = new Date();
            document.getElementById('receipt-date').textContent = now.toLocaleString();
            document.getElementById('receipt-order-number').textContent = orderNumber;

            // Set default payment method on receipt
            document.getElementById('receipt-payment-method').textContent = 'Cash';
        }

        // Render transaction history
        function renderHistoryItems() {
            const historyItemsContainer = document.getElementById('history-items');
            historyItemsContainer.innerHTML = '';

            if (transactionHistory.length === 0) {
                const emptyElement = document.createElement('div');
                emptyElement.className = 'text-center py-4 text-gray-500';
                emptyElement.textContent = 'No transaction history yet';
                historyItemsContainer.appendChild(emptyElement);

                // Update pagination controls
                document.getElementById('history-count').textContent = '0';
                document.getElementById('prev-history').disabled = true;
                document.getElementById('next-history').disabled = true;
                return;
            }

            // Calculate pagination
            const startIndex = (historyPage - 1) * HISTORY_PER_PAGE;
            const endIndex = Math.min(startIndex + HISTORY_PER_PAGE, transactionHistory.length);
            const paginatedHistory = transactionHistory.slice(startIndex, endIndex);

            // Render history items
            paginatedHistory.forEach(transaction => {
                const transactionDate = new Date(transaction.date);
                const itemCount = transaction.items.reduce((sum, item) => sum + item.quantity, 0);

                const historyElement = document.createElement('div');
                historyElement.className = 'grid grid-cols-6 gap-1 history-item cursor-pointer';
                historyElement.dataset.id = transaction.id;

                historyElement.innerHTML = `
                    <div class="grid-cell text-xs">${transactionDate.toLocaleDateString()}</div>
                    <div class="grid-cell font-medium">${transaction.id}</div>
                    <div class="grid-cell">${itemCount} items</div>
                    <div class="grid-cell">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                            transaction.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                        }">
                            ${transaction.paymentMethod === 'cash' ? 'Cash' :
                              transaction.paymentMethod === 'card' ? 'Card' :
                              'GCash/Maya'}
                        </span>
                    </div>
                    <div class="grid-cell font-bold">$${transaction.total.toFixed(2)}</div>
                    <div class="grid-cell">
                        <button class="view-receipt px-2 text-blue-600 hover:text-blue-800" data-id="${transaction.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                `;

                historyItemsContainer.appendChild(historyElement);
            });

            // Add event listeners for view receipt buttons
            document.querySelectorAll('.view-receipt').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const transactionId = parseInt(this.dataset.id);
                    viewReceipt(transactionId);
                });
            });

            // Add event listener for entire history item
            document.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', function() {
                    const transactionId = parseInt(this.dataset.id);
                    viewReceipt(transactionId);
                });
            });

            // Update pagination controls
            document.getElementById('history-count').textContent = `${startIndex + 1}-${endIndex} of ${transactionHistory.length}`;
            document.getElementById('prev-history').disabled = historyPage === 1;
            document.getElementById('next-history').disabled = endIndex >= transactionHistory.length;
        }

        // View receipt from history
        function viewReceipt(transactionId) {
            const transaction = transactionHistory.find(t => t.id === transactionId);
            if (!transaction) return;

            const transactionDate = new Date(transaction.date);

            // Populate receipt modal
            const modalReceiptContent = document.getElementById('modal-receipt-content');
            modalReceiptContent.innerHTML = `
                <div class="text-center mb-4">
                    <h3 class="font-bold text-lg">Croffle Corner</h3>
                    <p class="text-sm">123 Brew Street, Caffeine City</p>
                    <p class="text-sm">Tel: (555) 123-4567</p>
                </div>
                <div class="border-b border-gray-300 mb-2"></div>
                <div class="text-xs mb-2">
                    <div class="flex justify-between">
                        <span>Date:</span>
                        <span>${transactionDate.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Order #:</span>
                        <span>${transaction.id}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Payment Method:</span>
                        <span>${
                            transaction.paymentMethod === 'cash' ? 'Cash' :
                            transaction.paymentMethod === 'card' ? 'Credit/Debit Card' :
                            'GCash/Maya'
                        }</span>
                    </div>
                </div>
                <div class="border-b border-gray-300 mb-2"></div>
                <div class="text-xs mb-4">
                    ${transaction.items.map(item => `
                        <div class="flex justify-between mb-1">
                            <div>
                                <span>${item.quantity}x</span>
                                <span class="ml-2">${item.name}</span>
                            </div>
                            <div>$${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="border-b border-gray-300 mb-2"></div>
                <div class="text-xs mb-2">
                    <div class="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>$${transaction.total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="text-center mt-4 text-xs">
                    <p>Thank you for visiting!</p>
                    <p>Please come again</p>
                </div>
            `;

            // Set print button to print this receipt
            document.getElementById('print-modal-receipt').dataset.id = transaction.id;

            // Show modal
            document.getElementById('receipt-modal').classList.remove('hidden');
        }

        // Print modal receipt
        function printModalReceipt() {
            const receiptContent = document.getElementById('modal-receipt-content').innerHTML;
            const originalContent = document.body.innerHTML;

            document.body.innerHTML = `
                <div class="receipt p-4" style="width: 300px; margin: 0 auto;">
                    ${receiptContent}
                </div>
            `;

            window.print();
            document.body.innerHTML = originalContent;

            // Reinitialize the app after print
            initApp();
        }

        // Close receipt modal
        function closeReceiptModal() {
            document.getElementById('receipt-modal').classList.add('hidden');
        }

        // Navigate to previous history page
        function prevHistoryPage() {
            if (historyPage > 1) {
                historyPage--;
                renderHistoryItems();
            }
        }

        // Navigate to next history page
        function nextHistoryPage() {
            const totalPages = Math.ceil(transactionHistory.length / HISTORY_PER_PAGE);
            if (historyPage < totalPages) {
                historyPage++;
                renderHistoryItems();
            }
        }
