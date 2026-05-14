function loadCart() {
    const user = window.Auth ? Auth.currentUser() : null;
    
    if (!user) {
        const container = document.querySelector('.cart-container');
        container.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <h2>Access Denied</h2>
                <p>Please <a href="login.html">log in</a> to view your shopping bag.</p>
            </div>
        `;
        return; 
    }
    const cartWrapper = document.getElementById('cart-items-list');

    if (!cartWrapper) {
        return;
    }

    const rawData = localStorage.getItem('shoppingCart');

    const cartData = JSON.parse(rawData) || [];

    if (cartData.length === 0) {
        cartWrapper.innerHTML = "<h2>Your cart is empty.</h2>";
        updateTotals(0);
        return;
    }

    let subtotal = 0;
    let htmlContent = "";

    for (let i = 0; i < cartData.length; i++) {
        let item = cartData[i];
        
        let itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        htmlContent += `
            <div class="cart-item">
                <img src="${item.image}" width="100">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Color: ${item.color} | Length: ${item.length}"</p> <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="item-price">$${itemTotal.toFixed(2)}</div>
                </div>
        `;
    }

    cartWrapper.innerHTML = htmlContent;
    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    const subEl = document.getElementById('subtotal-amount');
    const totalEl = document.getElementById('final-total');
    
    if(subEl) subEl.innerText = "$" + subtotal.toFixed(2);
    if(totalEl) totalEl.innerText = "$" + subtotal.toFixed(2);
}

function removeItem(index) {
    let cartData = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    cartData.splice(index, 1);
    localStorage.setItem('shoppingCart', JSON.stringify(cartData));
    loadCart();
}

function proceedToCheckout() {
    if (!window.Auth || !Auth.isLoggedIn()) {
        window.location.href = 'login.html?message=' + encodeURIComponent('Please log in to checkout.');
        return;
    }

    const cartData = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (cartData.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    window.location.href = 'checkout.html';
}

// Start the process
loadCart();