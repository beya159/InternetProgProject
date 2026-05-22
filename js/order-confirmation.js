(function () {
    function ensureLoggedIn() {
        if (!window.Auth || typeof Auth.isLoggedIn !== 'function' || !Auth.isLoggedIn()) {
            window.location.href = 'login.html?message=Please log in to view your order.';
            return false;
        }
        return true;
    }

    function renderOrder(order) {
        var container = document.getElementById('confirmation-details');
        if (!container) return;

        var itemsHtml = (order.items || []).map(function (item) {
            var sizeText = (item.length && item.length !== "N/A") ? ' | ' + item.length + '"' : '';
            
            var imageSrc = item.image.startsWith('../') ? item.image : '../' + item.image;

            return '<div class="confirmation-item" style="display:flex; margin-bottom:15px; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px;">' +
                        '<img src="' + imageSrc + '" alt="' + item.name + '" width="60" style="margin-right:15px; border-radius:4px;">' +
                        '<div>' +
                            '<h3 style="margin:0; font-size:1.1rem;">' + item.name + '</h3>' +
                            '<p style="margin:4px 0; color:#666; font-size:0.9rem;">' + item.color + sizeText + '</p>' +
                            '<p style="margin:0; color:#666; font-size:0.9rem;">Quantity: ' + item.quantity + '</p>' +
                        '</div>' +
                    '</div>';
        }).join('');

        container.innerHTML = [
            '<div class="confirmation-summary" style="background:#f9f9f9; padding:20px; border-radius:8px; margin-bottom:20px; border:1px solid #eef;">',
                '<h2 style="margin-top:0; color:#333; border-bottom:2px solid #ccc; padding-bottom:5px;">Order Summary</h2>',
                '<p style="font-size:1.1rem;"><strong>Order Number:</strong> <span style="font-family:monospace; background:#e0e0e0; padding:2px 6px; border-radius:4px; font-weight:bold;">' + (order.orderNumber || 'N/A') + '</span></p>',
                '<p><strong>Customer Name:</strong> ' + (order.customer?.fullName || 'N/A') + '</p>',
                '<p><strong>Email Address:</strong> ' + (order.customer?.email || 'N/A') + '</p>',
                '<p><strong>Shipping Address:</strong> ' + (order.customer?.address || '') + ', ' + (order.customer?.city || '') + '</p>',
                '<p><strong>Delivery Option Selected:</strong> ' + (order.customer?.deliveryMethod || 'Standard Shipping') + '</p>',
                '<h3 style="margin-bottom:0; color:#111;">Total Amount Paid: $' + (typeof order.total === 'number' ? order.total.toFixed(2) : order.total) + '</h3>',
            '</div>',
            '<div class="confirmation-items" style="margin-top:25px;">',
                '<h2 style="color:#333;">Items Placed</h2>',
                itemsHtml,
            '</div>'
        ].join('');

        // display confirmation order token right up into the status subtitle banner container
        var statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.innerHTML = '<p style="color: #2b542c; background-color: #dff0d8; border: 1px solid #d6e9c6; padding: 12px; border-radius: 4px; font-weight: bold; text-align:center;">' +
                                 'Your transaction was processed successfully! Reference Code: ' + order.orderNumber + '</p>';
            statusEl.style.display = "block";
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!ensureLoggedIn()) {
            return;
        }

        if (!window.Auth || typeof Auth.getLastOrder !== 'function') {
            console.error("Authentication tracking pipeline script missing or broken.");
            return;
        }

        var order = Auth.getLastOrder();
        if (!order) {
            // if page was manually refreshed and data is cleared, fall back to avoid blank spaces
            var statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.innerHTML = '<p style="text-align:center; color:#666;">No recent session order payload details found active. View profile history settings for log metrics.</p>';
                statusEl.style.display = "block";
            }
            return;
        }

        renderOrder(order);
    });
})();