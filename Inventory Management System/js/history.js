<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activity History Log | MyInventory</title>
</head>

<body>

    <main>

        <h1>Activity History Log</h1>
        <p>Track items action such as additions, updates, and deletions in the system.</p>

        <table>
            <thead>
                <tr>
                    <th>Action</th>
                    <th>Item Name</th>
                    <th>Change</th>
                    <th>Timestamp</th>
                </tr>
            </thead>

            <tbody id="historyTableBody">
                <tr>
                    <td colspan="4">Loading history...</td>
                </tr>
            </tbody>
        </table>

    </main>

    <script>
    "use strict";

    (function () {

        // button,ids,and the activity each one records
        const BUTTON_ACTIONS = {
            "add-btn": "added",
            "update-btn": "updated",
            "quantity-btn": "quantity_changed",
            "delete-btn": "deleted"
        };

        const ITEM_NAME_INPUT_ID = "item-name";
        const ITEM_QUANTITY_INPUT_ID = "item-quantity";
        const TABLE_BODY_ID = "historyTableBody";
        const HISTORY_STORAGE_KEY = "inventoryStockHistory";
        const TIME_ZONE = "Asia/Manila";

        const ACTION_LABELS = {
            added: "Added",
            updated: "Updated",
            quantity_changed: "Quantity Changed",
            deleted: "Deleted"
        };

        function toNumber(value) {

            if (value === null || value === undefined || value === "") {
                return null;
            }

            const number = Number(value);

            return Number.isFinite(number) ? number : null;
        }


        // Storage, kayo na bahala here or mag-change kasi locolstorage pa ito as of now, kayo na bahala mag-ayos at ipantay accordingly sa database kapag ready na.

        function getStockHistory() {

            try {

                const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
                const history = saved ? JSON.parse(saved) : [];

                return Array.isArray(history)
                    ? history.filter(item => item && typeof item === "object")
                    : [];

            } catch (error) {

                console.error("Unable to load history:", error);
                return [];
            }
        }

        function saveStockHistory(history) {

            try {

                localStorage.setItem(
                    HISTORY_STORAGE_KEY,
                    JSON.stringify(history)
                );

                return true;

            } catch (error) {

                console.error("Unable to save history:", error);
                return false;
            }
        }

        //GANITO SIYA I-TEST, para marecord ang mga activity sa system (LOCALHOST PALANG PO ITO) HEHEHHE kayo na po bahala mag integrate.
        // logStockChange({ name: "Egg", action: "added", quantity: 2 })
        // logStockChange({ name: "Egg", action: "quantity_changed", previousQuantity: 5, quantity: 8 })
        // quantity and previousQuantity are optional



        function logStockChange(details = {}) {

            const name = details.name;
            const action = details.action;

            if (typeof name !== "string" || !name.trim()) {
                console.error("Invalid item name.");
                return false;
            }

            if (!Object.prototype.hasOwnProperty.call(ACTION_LABELS, action)) {
                console.error("Invalid activity:", action);
                return false;
            }

            const record = {
                name: name.trim(),
                action: action,
                quantity: toNumber(details.quantity),
                previousQuantity: toNumber(details.previousQuantity),
                date_time: new Date().toISOString()
            };

            const history = getStockHistory();

            history.unshift(record);

            if (!saveStockHistory(history)) {
                return false;
            }

            window.dispatchEvent(
                new CustomEvent("stockHistoryUpdated", { detail: record })
            );

            return true;
        }


        // Inventory page buttons

        function getItemName(button) {

            if (button.dataset && button.dataset.itemName) {
                return button.dataset.itemName;
            }

            const input = document.getElementById(ITEM_NAME_INPUT_ID);

            return input ? input.value : "";
        }

        function getItemQuantity(button) {

            if (button.dataset && button.dataset.itemQuantity) {
                return button.dataset.itemQuantity;
            }

            const input = document.getElementById(ITEM_QUANTITY_INPUT_ID);

            return input ? input.value : "";
        }

        function setupButtons() {

            Object.keys(BUTTON_ACTIONS).forEach(buttonId => {

                const button = document.getElementById(buttonId);

                if (!button) {
                    return;
                }

                button.addEventListener("click", function () {

                    logStockChange({
                        name: getItemName(button),
                        action: BUTTON_ACTIONS[buttonId],
                        quantity: getItemQuantity(button)
                    });
                });
            });
        }


        // Timestamp, PHT as said timezone ne need, below is the example format.
        // Example: "Nov 17, 2026 06:11 PM"
    
        function formatDateTime(dateTime) {

            const date = new Date(dateTime);

            if (Number.isNaN(date.getTime())) {
                return "Invalid date";
            }

            return date.toLocaleString("en-US", {
                timeZone: TIME_ZONE,
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }).replace(/(\d{4}),/, "$1");
        }

        // ito ang funtions kapag nag-record kayo ng isang item. ito ang gumagawa o nagiging engine ng pag-record ng activity sa system,kaya nagdidisplay siya hahaha goodluck guys.
        function getChangeText(record) {

            const quantity = toNumber(record.quantity);
            const previous = toNumber(record.previousQuantity);

            if (quantity === null) {
                return "—";
            }

            if (record.action === "added") {
                return "+" + quantity;
            }

            if (record.action === "deleted") {
                return "-" + quantity;
            }

            if (record.action === "quantity_changed" && previous !== null) {
                const difference = quantity - previous;
                return (difference > 0 ? "+" : "") + difference;
            }

            return String(quantity);
        }

        function displayStockHistory() {

            const tableBody = document.getElementById(TABLE_BODY_ID);

            if (!tableBody) {
                return;
            }

            const history = getStockHistory();

            tableBody.replaceChildren();

            if (history.length === 0) {

                const row = document.createElement("tr");
                const cell = document.createElement("td");

                cell.colSpan = 4;
                cell.textContent = "No activity found.";

                row.appendChild(cell);
                tableBody.appendChild(row);

                return;
            }

            history.forEach(record => {

                const row = document.createElement("tr");

                const actionCell = document.createElement("td");
                actionCell.textContent =
                    ACTION_LABELS[record.action] || "Unknown";

                const nameCell = document.createElement("td");
                nameCell.textContent =
                    typeof record.name === "string" ? record.name : "Unknown item";

                const changeCell = document.createElement("td");
                changeCell.textContent = getChangeText(record);

                const dateCell = document.createElement("td");
                dateCell.textContent = formatDateTime(record.date_time);

                row.appendChild(actionCell);
                row.appendChild(nameCell);
                row.appendChild(changeCell);
                row.appendChild(dateCell);

                tableBody.appendChild(row);
            });
        }

        function setupHistoryPage() {

            if (!document.getElementById(TABLE_BODY_ID)) {
                return;
            }

            window.addEventListener("stockHistoryUpdated", displayStockHistory);

            window.addEventListener("storage", function (event) {
                if (event.key === HISTORY_STORAGE_KEY) {
                    displayStockHistory();
                }
            });

            displayStockHistory();
        }


        function init() {
            setupButtons();
            setupHistoryPage();
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
        } else {
            init();
        }

        window.logStockChange = logStockChange;
        window.getStockHistory = getStockHistory;
        window.displayStockHistory = displayStockHistory;

    })();
    </script>

</body>
</html>
