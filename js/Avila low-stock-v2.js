const LOW_STOCK_FIELDS = {
    name: 'name',
    quantity: 'quantity',
    restockLevel: 'restock_level'
};

const LowStockAlert = (function () {

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
        const box = findBox(container);
        if (!box) return;

        const low = getLowItems(items);
        box.innerHTML = '';
        box.classList.add('low-stock-alert');
        box.hidden = low.length === 0;
        if (low.length === 0) return;

        const title = document.createElement('strong');
        title.textContent = 'Restock needed (' + low.length + ' item' + (low.length === 1 ? '' : 's') + ')';
        box.appendChild(title);

        const list = document.createElement('ul');
        low.forEach(function (item) {
            const status = getStatus(item);
            const li = document.createElement('li');
            li.className = 'low-stock-' + status;
            li.textContent = item[LOW_STOCK_FIELDS.name] + ' - ' +
                (status === 'out' ? 'OUT OF STOCK' : item[LOW_STOCK_FIELDS.quantity] + ' left') +
                ' (restock level: ' + item[LOW_STOCK_FIELDS.restockLevel] + ')';
            list.appendChild(li);
        });
        box.appendChild(list);
    }

    return { getStatus: getStatus, getLowItems: getLowItems, render: render };
})();
