(function () {
    function setMessage(text, type) {
        var status = document.getElementById('status');
        if (!status) {
            return;
        }

        status.textContent = text;
        status.className = type ? 'status-message ' + type : 'status-message';
        
        // style adjustments to ensure visibility based on your css
        status.style.display = "block";
        status.style.padding = "10px";
        status.style.marginBottom = "15px";
        status.style.borderRadius = "4px";
        status.style.fontWeight = "bold";

        if (type == 'error') {
            status.style.backgroundColor = "#f8d7da";
            status.style.color = "#721c24";
            status.style.border = "1px solid #f5c6cb";
        } else {
            status.style.backgroundColor = "#e2e3e5";
            status.style.color = "#383d41";
            status.style.border = "1px solid #d6d8db";
        }

        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function ensureLoggedIn() {
        if (!window.Auth || typeof Auth.isLoggedIn !== 'function' || !Auth.isLoggedIn()) {
            window.location.href = 'login.html?message=Please log in to checkout.';
            return false;
        }
        return true;
    }

    // safely look up cookies without throwing errors
    function getCheckoutCookie(name) {
        if (typeof getCookie == 'function') {
            return getCookie(name);
        }
        // fallback helper if main.js loads late
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) {
            try {
                return JSON.parse(decodeURIComponent(match[2]));
            } catch(e) {
                return [];
            }
        }
        return [];
    }

    window.loadCart = function() {
        var cartItems = getCheckoutCookie('shoppingCart') || [];
        var orderItems = document.getElementById('order-items');
        var subtotal = 0;

        if (!orderItems) return;

        if (cartItems.length == 0) {
            orderItems.innerHTML = '<p>Your cart is empty.</p>';
            setMessage('Add items to your cart before checkout.', 'info');
            return;
        }

        orderItems.innerHTML = cartItems.map(function (item) {
            var itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            var sizeText = (item.length && item.length !== "N/A") ? ' | ' + item.length + '"' : '';
            
            return '<div class="order-item" style="display:flex; margin-bottom:10px; align-items:center; justify-content:space-between;">' +
                        '<div style="display:flex; align-items:center;">' +
                            '<img src="' + "../" + item.image + '" alt="' + item.name + '" width="50" style="margin-right:10px;">' +
                            '<div>' +
                                '<h3 style="font-size:1rem; margin:0;">' + item.name + '</h3>' +
                                '<p style="margin:2px 0; font-size:0.85rem; color:#666;">' + item.color + sizeText + '</p>' +
                                '<p style="margin:2px 0; font-size:0.85rem; color:#666;">Qty: ' + item.quantity + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<strong>$' + itemTotal.toFixed(2) + '</strong>' +
                    '</div>';
        }).join('');

        var deliveryDropdown = document.getElementById('delivery-option');
        var deliveryCost = (deliveryDropdown && deliveryDropdown.value == 'express') ? 15.00 : 0.00;
        
        var shippingTextEl = document.getElementById('shipping-rate-text');
        if (shippingTextEl) {
            shippingTextEl.textContent = deliveryCost > 0 ? '$15.00' : 'FREE';
        }

        var estimatedTax = subtotal * 0.15;
        var total = subtotal + estimatedTax + deliveryCost;

        document.getElementById('subtotal-amount').textContent = '$' + subtotal.toFixed(2);
        if (document.getElementById('tax-amount')) {
            document.getElementById('tax-amount').textContent = '$' + estimatedTax.toFixed(2);
        }
        document.getElementById('final-total').textContent = '$' + total.toFixed(2);
    };

    function seedForm() {
        if (!window.Auth) return;
        var user = typeof Auth.currentUser == 'function' ? Auth.currentUser() : {};
        
        var nameField = document.getElementById('full-name');
        var emailField = document.getElementById('email');

        if (nameField && typeof Auth.getDisplayName == 'function') {
            nameField.value = Auth.getDisplayName(user) || '';
        }
        if (emailField && user && user.email) {
            emailField.value = user.email || '';
        }
    }

    function validateFormInputs() {
        var fullName = document.getElementById('full-name').value.trim();
        var email = document.getElementById('email').value.trim();
        var phone = document.getElementById('phone').value.trim();
        var address = document.getElementById('address').value.trim();
        var city = document.getElementById('city').value.trim();
        var cardNumber = document.getElementById('card-number').value.replace(/\s+/g, '');
        var expiry = document.getElementById('expiry').value.trim();

        if (!fullName || !email || !phone || !address || !city || !cardNumber || !expiry) {
            setMessage('All checkout fields are required.', 'error');
            return false;
        }

        if (fullName.split(/\s+/).length < 2) {
            setMessage('Please enter both your first and last name.', 'error');
            return false;
        }

        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage('Please provide a valid email address (e.g., name@domain.com).', 'error');
            return false;
        }

        var phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setMessage('Please enter a valid 10-digit phone number.', 'error');
            return false;
        }

        var addressRegex = /^\d+\s+[A-Za-z0-9\s.,'-]+$/;
        if (!addressRegex.test(address)) {
            setMessage('Please enter a valid street address starting with a civic number (e.g., 123 Main St).', 'error');
            return false;
        }

        if (city.length < 2 || /\d/.test(city)) {
            setMessage('Please enter a valid city name.', 'error');
            return false;
        }

        var cardRegex = /^\d{13,19}$/;
        if (!cardRegex.test(cardNumber)) {
            setMessage('Invalid card formatting! Card must be between 13 and 19 digits.', 'error');
            return false;
        }

        var expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryRegex.test(expiry)) {
            setMessage('Expiry date must match the format MM/YY.', 'error');
            return false;
        }

        return true;
    }

    document.addEventListener('DOMContentLoaded', function () {
        // refuse non-authenticated requests come through
        if (window.Auth && typeof Auth.isLoggedIn == 'function') {
            if (!ensureLoggedIn()) return;
        }

        loadCart();
        seedForm();

        var form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', function (event) {
                // block early page reloads immediately!
                event.preventDefault(); 

                try {
                    // run form constraints validation checks
                    if (!validateFormInputs()) {
                        return; 
                    }

                    var cartItems = getCheckoutCookie('shoppingCart') || [];
                    if (cartItems.length == 0) {
                        setMessage('Your cart is empty. Cannot process order.', 'error');
                        return;
                    }

                    var fullName = document.getElementById('full-name').value.trim();
                    var email = document.getElementById('email').value.trim();
                    var address = document.getElementById('address').value.trim();
                    var city = document.getElementById('city').value.trim();
                    var deliveryDropdown = document.getElementById('delivery-option');
                    var deliveryMethodText = deliveryDropdown ? deliveryDropdown.options[deliveryDropdown.selectedIndex].text : 'Standard Shipping';

                    var orderNumber = 'JWL-' + Math.floor(100000 + Math.random() * 900000);
                    
                    var subtotal = cartItems.reduce(function (sum, item) {
                        return sum + item.price * item.quantity;
                    }, 0);
                    var deliveryCost = (deliveryDropdown && deliveryDropdown.value == 'express') ? 15.00 : 0.00;
                    var finalTotalWithTaxAndDelivery = (subtotal * 1.15) + deliveryCost;

                    if (window.Auth && typeof Auth.setLastOrder == 'function') {
                        Auth.setLastOrder({
                            orderNumber: orderNumber,
                            customer: {
                                fullName: fullName,
                                email: email,
                                address: address,
                                city: city,
                                deliveryMethod: deliveryMethodText
                            },
                            items: cartItems,
                            total: finalTotalWithTaxAndDelivery,
                            placedAt: new Date().toISOString()
                        });
                    }

                    // empty out cookie storage arrays safely
                    if (typeof setCookie == 'function') {
                        setCookie('shoppingCart', [], -1);
                    } else {
                        document.cookie = "shoppingCart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    }
                    
                    if (typeof updateCartBadge == 'function') {
                        updateCartBadge();
                    }

                    // Proceed cleanly to order confirmation page
                    window.location.href = 'order-confirmation.html';

                } catch (err) {
                    console.error("An error occurred during payment processing calculation pipelines: ", err);
                    setMessage('An unexpected error occurred. Please verify your entries and try again.', 'error');
                }
            });
        }
    });
})();