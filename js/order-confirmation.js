(function () {
    function ensureLoggedIn() {
    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html?message=Please log in to view your order.';
        return false;
    }

    return true;
}

    function renderOrder(order) {
        var container = document.getElementById('confirmation-details');
        var itemsHtml = order.items.map(function (item) {
            return '<div class="confirmation-item"><img src="' + item.image + '" alt="' + item.name + '"><div><h3>' + item.name + '</h3><p>' + item.color + ' | ' + item.length + ' inches</p><p>Quantity: ' + item.quantity + '</p></div></div>';
        }).join('');

        container.innerHTML = [
            '<div class="confirmation-summary">',
            '<p><strong>Order number:</strong> ' + order.orderNumber + '</p>',
            '<p><strong>Name:</strong> ' + order.customer.fullName + '</p>',
            '<p><strong>Email:</strong> ' + order.customer.email + '</p>',
            '<p><strong>Address:</strong> ' + order.customer.address + ', ' + order.customer.city + '</p>',
            '<p><strong>Total:</strong> $' + order.total.toFixed(2) + '</p>',
            '</div>',
            '<div class="confirmation-items">' + itemsHtml + '</div>'
        ].join('');
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!ensureLoggedIn()) {
            return;
        }

        var order = Auth.getLastOrder();
        if (!order) {
            window.location.href = 'checkout.html';
            return;
        }

        renderOrder(order);
        Auth.clearLastOrder();
    });
})();