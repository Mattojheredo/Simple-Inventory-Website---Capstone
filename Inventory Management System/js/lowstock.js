const LOW_STOCK_FIELDS = {
    name: 'name',
    quantity: 'quantity',
    restockLevel: 'restock_level'
};

const LowStockAlert = (function () {

    // Where the "View Items" button goes (the page that shows only low stock items)
    let viewItemsLink = 'my_items.php?low_stock=1';

    function getStatus(item) {
        const qty = Number(item[LOW_STOCK_FIELDS.quantity]);
        const level = Number(item[LOW_STOCK_FIELDS.restockLevel]);
        if (!Number.isFinite(qty) || !Number.isFinite(level)) return 'ok';
        if (qty === 0) return 'out';
        if (qty <= level) return 'low';
        return 'ok';
    }

    function getLowItems(items) {
        return items
            .filter(function (item) { return getStatus(item) !== 'ok'; })
            .sort(function (a, b) {
                return Number(a[LOW_STOCK_FIELDS.quantity]) - Number(b[LOW_STOCK_FIELDS.quantity]);
            });
    }

    // Builds the alert text, counting low and out of stock items separately
    function getMessage(low) {
        const outCount = low.filter(function (item) { return getStatus(item) === 'out'; }).length;
        const lowCount = low.length - outCount;

        const lowText = lowCount + (lowCount === 1 ? ' item is' : ' items are') + ' running low';
        const outText = outCount + (outCount === 1 ? ' item is' : ' items are') + ' out of stock';

        if (outCount === 0) return lowText + '!';
        if (lowCount === 0) return outText + '!';
        return lowCount + (lowCount === 1 ? ' item is' : ' items are') + ' running low, ' + outCount + ' out of stock!';
    }

    // Default look. Written with :where() so it has the lowest priority:
    // any CSS on the page for these class names wins, no !important needed.
    function addStyles() {
        if (document.getElementById('low-stock-styles')) return;
        const style = document.createElement('style');
        style.id = 'low-stock-styles';
        style.textContent =
            ':where(.low-stock-alert){display:flex;justify-content:space-between;align-items:center;gap:16px;' +
            'background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.4);color:#f87171;' +
            'border-radius:12px;padding:14px 18px;font-family:system-ui,sans-serif;}' +
            ':where(.low-stock-message){font-size:13px;margin-top:4px;}' +
            ':where(.low-stock-button){border:1px solid #f87171;color:#f87171;border-radius:8px;' +
            'padding:8px 14px;font-size:13px;text-decoration:none;white-space:nowrap;}';
        document.head.appendChild(style);
    }

    function findBox(container) {
        if (typeof container !== 'string') return container;
        let box = document.getElementById(container);
        if (!box) {
            box = document.createElement('div');
            box.id = container;
            const anchor = document.querySelector('main') || document.body;
            anchor.insertBefore(box, anchor.firstChild);
        }
        return box;
    }

    function render(items, container) {
        addStyles();
        const box = findBox(container);
        if (!box) return;

        const low = getLowItems(items);
        box.innerHTML = '';
        box.classList.add('low-stock-alert');
        box.hidden = low.length === 0;
        box.style.display = low.length === 0 ? 'none' : '';
        if (low.length === 0) return;

        // Red alert card (the look comes from the .low-stock-* classes)
        const text = document.createElement('div');

        const title = document.createElement('strong');
        title.className = 'low-stock-title';
        title.textContent = '⚠️ Low Stock Alert';
        text.appendChild(title);

        const message = document.createElement('div');
        message.className = 'low-stock-message';
        message.textContent = getMessage(low);
        text.appendChild(message);

        const button = document.createElement('a');
        button.className = 'low-stock-button';
        button.textContent = 'View Items →';
        button.href = viewItemsLink;

        box.appendChild(text);
        box.appendChild(button);
    }

    function setViewItemsLink(link) {
        viewItemsLink = link;
    }

    return { getStatus: getStatus, getLowItems: getLowItems, render: render, setViewItemsLink: setViewItemsLink };
})();
