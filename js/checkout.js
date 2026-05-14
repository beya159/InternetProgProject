(function () {
    function setMessage(text, type) {
        var status = document.getElementById('status');
        if (!status) {
            return;
        }

        status.textContent = text;
        status.className = type ? 'status-message ' + type : 'status-message';
    }

    function ensureLoggedIn() {
        if (!Auth.isLoggedIn()) {
            window.location.href = 'login.html?message=' + encodeURIComponent('Please log in to checkout.');
            return false;
        }

        return true;
    }

    function loadCart() {
        var cartItems = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        var orderItems = document.getElementById('order-items');
        var subtotal = 0;

        if (!orderItems) {
            return;
        }

        if (cartItems.length === 0) {
            orderItems.innerHTML = '<p>Your cart is empty.</p>';
            setMessage('Add items to your cart before checkout.', 'info');
            return;
        }

        orderItems.innerHTML = cartItems.map(function (item) {
            var itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return '<div class="order-item"><img src="' + item.image + '" alt="' + item.name + '"><div><h3>' + item.name + '</h3><p>' + item.color + ' | ' + item.length + ' inches</p><p>Quantity: ' + item.quantity + '</p></div><strong>$' + itemTotal.toFixed(2) + '</strong></div>';
        }).join('');

        document.getElementById('subtotal-amount').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('final-total').textContent = '$' + subtotal.toFixed(2);
    }

    function seedForm() {
        var user = Auth.currentUser() || {};
        document.getElementById('full-name').value = Auth.getDisplayName(user) || '';
        document.getElementById('email').value = user.email || '';
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!ensureLoggedIn()) {
            return;
        }

        loadCart();
        seedForm();

        document.getElementById('checkout-form').addEventListener('submit', function (event) {
            event.preventDefault();

            var fullName = document.getElementById('full-name').value.trim();
            var email = document.getElementById('email').value.trim();
            var address = document.getElementById('address').value.trim();
            var city = document.getElementById('city').value.trim();
            var cardNumber = document.getElementById('card-number').value.replace(/\s+/g, '');
            var expiry = document.getElementById('expiry').value.trim();

            if (!fullName || !email || !address || !city || !cardNumber || !expiry) {
                setMessage('All checkout fields are required.', 'error');
                return;
            }

            var cartItems = JSON.parse(localStorage.getItem('shoppingCart')) || [];
            if (cartItems.length === 0) {
                setMessage('Your cart is empty.', 'error');
                return;
            }

            var orderNumber = 'JWL-' + Math.floor(100000 + Math.random() * 900000);
            var total = cartItems.reduce(function (sum, item) {
                return sum + item.price * item.quantity;
            }, 0);

            Auth.setLastOrder({
                orderNumber: orderNumber,
                customer: {
                    fullName: fullName,
                    email: email,
                    address: address,
                    city: city
                },
                items: cartItems,
                total: total,
                placedAt: new Date().toISOString()
            });

            localStorage.removeItem('shoppingCart');
            window.location.href = 'order-confirmation.html';
        });
    });
})();