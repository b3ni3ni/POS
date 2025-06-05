/**
 * Reports UI Management
 * Handles rendering controls and displaying reports from ReportingService.
 */
const ReportsUI = (function() {
    const reportsContainerMainId = 'reports-container'; // The main placeholder div from index.html
    const reportControlsId = 'report-controls-area';
    const reportDisplayAreaId = 'report-display-area';

    /**
     * Renders the report selection controls (dropdown, date pickers, button).
     */
    function renderReportSelectionControls() {
        const mainContainer = document.getElementById(reportsContainerMainId);
        if (!mainContainer) {
            console.error("Main reports container not found.");
            return;
        }

        // Create dedicated divs for controls and display if they don't exist
        let controlsDiv = document.getElementById(reportControlsId);
        if (!controlsDiv) {
            controlsDiv = document.createElement('div');
            controlsDiv.id = reportControlsId;
            controlsDiv.className = 'mb-6 p-4 bg-gray-100 rounded-lg shadow';
            mainContainer.appendChild(controlsDiv);
        }

        let displayDiv = document.getElementById(reportDisplayAreaId);
        if (!displayDiv) {
            displayDiv = document.createElement('div');
            displayDiv.id = reportDisplayAreaId;
            displayDiv.className = 'p-4 bg-white rounded-lg shadow min-h-[100px]'; // min-h for visibility
            mainContainer.appendChild(displayDiv);
        }

        controlsDiv.innerHTML = `
            <div class="flex flex-wrap items-end gap-4">
                <div>
                    <label for="report-type-select" class="block text-sm font-medium text-gray-700">Report Type:</label>
                    <select id="report-type-select" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="">-- Select a Report --</option>
                        <option value="salesSummary">Sales Summary</option>
                        <option value="inventoryStatus">Inventory Status</option>
                        <option value="profitByProduct">Profit by Product</option>
                    </select>
                </div>
                <div id="date-range-controls" class="flex gap-4 hidden">
                    <div>
                        <label for="report-start-date" class="block text-sm font-medium text-gray-700">Start Date:</label>
                        <input type="date" id="report-start-date" class="mt-1 block w-full input-styling">
                    </div>
                    <div>
                        <label for="report-end-date" class="block text-sm font-medium text-gray-700">End Date:</label>
                        <input type="date" id="report-end-date" class="mt-1 block w-full input-styling">
                    </div>
                </div>
                <div>
                    <button id="generate-report-btn" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50" disabled>
                        Generate Report
                    </button>
                </div>
            </div>
        `;

        // Apply common input styling (if not already global)
        controlsDiv.querySelectorAll('.input-styling').forEach(el => el.classList.add('px-3', 'py-2', 'border', 'border-gray-300', 'rounded-md', 'shadow-sm', 'focus:outline-none', 'focus:ring-indigo-500', 'focus:border-indigo-500', 'sm:text-sm'));


        document.getElementById('report-type-select').addEventListener('change', handleReportTypeChange);
        document.getElementById('generate-report-btn').addEventListener('click', handleGenerateReport);

        displayDiv.innerHTML = '<p class="text-gray-500">Select a report type and click "Generate Report".</p>';
    }

    /**
     * Shows or hides date range inputs based on selected report type.
     */
    function handleReportTypeChange(event) {
        const selectedType = event.target.value;
        const dateRangeControls = document.getElementById('date-range-controls');
        const generateBtn = document.getElementById('generate-report-btn');

        if (selectedType === "salesSummary" || selectedType === "profitByProduct") {
            dateRangeControls.classList.remove('hidden');
        } else {
            dateRangeControls.classList.add('hidden');
        }
        generateBtn.disabled = !selectedType;
    }

    /**
     * Handles the "Generate Report" button click.
     */
    function handleGenerateReport() {
        const reportType = document.getElementById('report-type-select').value;
        const startDateInput = document.getElementById('report-start-date');
        const endDateInput = document.getElementById('report-end-date');
        const displayArea = document.getElementById(reportDisplayAreaId);

        if (!reportType) {
            displayArea.innerHTML = '<p class="text-red-500">Please select a report type.</p>';
            return;
        }

        displayArea.innerHTML = '<p class="text-gray-700">Generating report, please wait...</p>';

        const startDate = (reportType === "salesSummary" || reportType === "profitByProduct") && startDateInput.value ? startDateInput.value : null;
        const endDate = (reportType === "salesSummary" || reportType === "profitByProduct") && endDateInput.value ? endDateInput.value : null;

        // Basic date validation
        if ((startDate && !endDate) || (!startDate && endDate)) {
             displayArea.innerHTML = '<p class="text-red-500">Please provide both start and end dates, or leave both empty for all-time reports.</p>';
            return;
        }
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            displayArea.innerHTML = '<p class="text-red-500">Start date cannot be after end date.</p>';
            return;
        }

        try {
            let reportData;
            switch (reportType) {
                case 'salesSummary':
                    reportData = ReportingService.generateSalesSummaryReport(startDate, endDate);
                    renderSalesSummaryReport(reportData);
                    break;
                case 'inventoryStatus':
                    reportData = ReportingService.generateInventoryStatusReport();
                    renderInventoryStatusReport(reportData);
                    break;
                case 'profitByProduct':
                    reportData = ReportingService.generateProfitByProductReport(startDate, endDate);
                    renderProfitByProductReport(reportData);
                    break;
                default:
                    displayArea.innerHTML = '<p class="text-red-500">Invalid report type selected.</p>';
            }
        } catch (error) {
            console.error("Error generating report:", error);
            displayArea.innerHTML = `<p class="text-red-500">An error occurred while generating the report: ${error.message}</p>`;
        }
    }

    /**
     * Renders the Sales Summary report.
     * @param {object} data - Report data from ReportingService.
     */
    function renderSalesSummaryReport(data) {
        const displayArea = document.getElementById(reportDisplayAreaId);
        if (!data) {
            displayArea.innerHTML = '<p class="text-orange-500">No data available for Sales Summary.</p>';
            return;
        }
        let html = `<h3 class="text-xl font-semibold mb-3 text-gray-800">Sales Summary</h3>
                    <p class="text-sm text-gray-600 mb-2">Period: ${data.period.startDate} to ${data.period.endDate}</p>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div class="bg-blue-50 p-3 rounded shadow"><strong>Total Sales:</strong> ${data.totalSalesCount}</div>
                        <div class="bg-green-50 p-3 rounded shadow"><strong>Total Revenue:</strong> $${data.totalRevenue.toFixed(2)}</div>
                        <div class="bg-yellow-50 p-3 rounded shadow"><strong>Total Discounts:</strong> $${data.totalDiscounts.toFixed(2)}</div>
                        <div class="bg-red-50 p-3 rounded shadow"><strong>Total COGS:</strong> $${data.totalCOGS.toFixed(2)}</div>
                        <div class="bg-teal-50 p-3 rounded shadow"><strong>Total Profit:</strong> <span class="${data.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'} font-bold">$${data.totalProfit.toFixed(2)}</span></div>
                    </div>`;

        if (data.topSellingItems && data.topSellingItems.length > 0) {
            html += `<h4 class="text-lg font-semibold mt-4 mb-2 text-gray-700">Top Selling Items (by Revenue)</h4>
                     <div class="overflow-x-auto"><table class="min-w-full bg-white border border-gray-300 text-sm">
                        <thead class="bg-gray-200"><tr>
                            <th class="px-4 py-2 border">Product</th><th class="px-4 py-2 border">Qty Sold</th>
                            <th class="px-4 py-2 border">Revenue</th><th class="px-4 py-2 border">COGS</th><th class="px-4 py-2 border">Profit</th>
                        </tr></thead><tbody>`;
            data.topSellingItems.forEach(item => {
                html += `<tr>
                            <td class="border px-4 py-2">${item.productName}</td>
                            <td class="border px-4 py-2 text-center">${item.quantitySold}</td>
                            <td class="border px-4 py-2 text-right">$${item.revenueGenerated.toFixed(2)}</td>
                            <td class="border px-4 py-2 text-right">$${item.cogs.toFixed(2)}</td>
                            <td class="border px-4 py-2 text-right font-medium ${item.profit >=0 ? 'text-green-600':'text-red-600'}">$${item.profit.toFixed(2)}</td>
                         </tr>`;
            });
            html += `</tbody></table></div>`;
        }

        if (data.salesByPaymentMethod && Object.keys(data.salesByPaymentMethod).length > 0) {
            html += `<h4 class="text-lg font-semibold mt-4 mb-2 text-gray-700">Sales by Payment Method</h4>
                     <div class="overflow-x-auto"><table class="min-w-full bg-white border border-gray-300 text-sm">
                        <thead class="bg-gray-200"><tr><th class="px-4 py-2 border">Payment Method</th><th class="px-4 py-2 border">Total Revenue</th></tr></thead><tbody>`;
            for (const method in data.salesByPaymentMethod) {
                html += `<tr><td class="border px-4 py-2">${method}</td><td class="border px-4 py-2 text-right">$${data.salesByPaymentMethod[method].toFixed(2)}</td></tr>`;
            }
            html += `</tbody></table></div>`;
        }
        displayArea.innerHTML = html;
    }

    /**
     * Renders the Inventory Status report.
     * @param {object} data - Report data from ReportingService.
     */
    function renderInventoryStatusReport(data) {
        const displayArea = document.getElementById(reportDisplayAreaId);
         if (!data) {
            displayArea.innerHTML = '<p class="text-orange-500">No data available for Inventory Status.</p>';
            return;
        }
        let html = `<h3 class="text-xl font-semibold mb-3 text-gray-800">Inventory Status</h3>
                    <p class="text-sm text-gray-600 mb-2">Total Ingredient Types: ${data.totalIngredientCount}</p>`;

        function renderTable(title, items, titleClass = 'text-gray-700') {
            let tableHtml = `<h4 class="text-lg font-semibold mt-4 mb-2 ${titleClass}">${title} (${items.length})</h4>`;
            if (items.length === 0) {
                tableHtml += '<p class="text-sm text-gray-500">None.</p>';
                return tableHtml;
            }
            tableHtml += `<div class="overflow-x-auto"><table class="min-w-full bg-white border border-gray-300 text-sm">
                            <thead class="bg-gray-200"><tr>
                                <th class="px-4 py-2 border">Ingredient</th><th class="px-4 py-2 border">Current Qty</th>
                                <th class="px-4 py-2 border">Unit</th><th class="px-4 py-2 border">Reorder Level</th>
                            </tr></thead><tbody>`;
            items.forEach(item => {
                tableHtml += `<tr>
                                <td class="border px-4 py-2">${item.name}</td>
                                <td class="border px-4 py-2 text-center">${item.quantity}</td>
                                <td class="border px-4 py-2">${item.unit}</td>
                                <td class="border px-4 py-2 text-center">${item.reorderLevel}</td>
                              </tr>`;
            });
            tableHtml += `</tbody></table></div>`;
            return tableHtml;
        }

        html += renderTable('Out of Stock Ingredients', data.outOfStockIngredients, 'text-red-600');
        html += renderTable('Low Stock Ingredients', data.lowStockIngredients, 'text-yellow-600');
        // html += `<p class="text-sm mt-4">Sufficient Stock Items: ${data.sufficientStockCount}</p>`; // Optional

        displayArea.innerHTML = html;
    }

    /**
     * Renders the Profit by Product report.
     * @param {object} data - Report data from ReportingService.
     */
    function renderProfitByProductReport(data) {
        const displayArea = document.getElementById(reportDisplayAreaId);
        if (!data || data.length === 0) {
            displayArea.innerHTML = '<p class="text-orange-500">No data available for Profit by Product report for the selected period.</p>';
            return;
        }
        let html = `<h3 class="text-xl font-semibold mb-3 text-gray-800">Profit by Product</h3>
                    <div class="overflow-x-auto"><table class="min-w-full bg-white border border-gray-300 text-sm">
                        <thead class="bg-gray-200"><tr>
                            <th class="px-4 py-2 border">Product</th><th class="px-4 py-2 border">Qty Sold</th>
                            <th class="px-4 py-2 border">Total Revenue</th><th class="px-4 py-2 border">Total COGS</th>
                            <th class="px-4 py-2 border">Total Profit</th><th class="px-4 py-2 border">Profit Margin</th>
                        </tr></thead><tbody>`;
        data.forEach(item => {
            html += `<tr>
                        <td class="border px-4 py-2">${item.productName}</td>
                        <td class="border px-4 py-2 text-center">${item.quantitySold}</td>
                        <td class="border px-4 py-2 text-right">$${item.totalRevenue.toFixed(2)}</td>
                        <td class="border px-4 py-2 text-right">$${item.totalCOGS.toFixed(2)}</td>
                        <td class="border px-4 py-2 text-right font-medium ${item.totalProfit >= 0 ? 'text-green-600':'text-red-600'}">$${item.totalProfit.toFixed(2)}</td>
                        <td class="border px-4 py-2 text-right ${item.profitMargin >= 0 ? 'text-green-600':'text-red-600'}">${item.profitMargin.toFixed(2)}%</td>
                     </tr>`;
        });
        html += `</tbody></table></div>`;
        displayArea.innerHTML = html;
    }

    /**
     * Initializes the Reports UI components.
     */
    function initReportsUI() {
        renderReportSelectionControls();
    }

    return {
        initReportsUI
    };
})();

// app.js will call ReportsUI.initReportsUI()
