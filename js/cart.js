// --- js/cart.js ---

function loadCart() {
    const user = localStorage.getItem('currentUser');
    
    if (!user) {
        // if not logged in, hide the cart and show a message
        const container = document.querySelector('.cart-container');
        container.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <h2>Access Denied</h2>
                <p>Please <a href="login.html">log in</a> to view your shopping bag.</p>
            </div>
        `;
        return; 
    }
    console.log("1. loadCart function started");

    const cartWrapper = document.getElementById('cart-items-list');
    console.log("2. Looking for 'cart-items-list':", cartWrapper);

    if (!cartWrapper) {
        alert("CRITICAL ERROR: Could not find the div with id 'cart-items-list' in your HTML!");
        return;
    }

    const rawData = localStorage.getItem('shoppingCart');
    console.log("3. Raw data from LocalStorage:", rawData);

    const cartData = JSON.parse(rawData) || [];
    console.log("4. Parsed Cart Array:", cartData);

    if (cartData.length === 0) {
        cartWrapper.innerHTML = "<h2>Your cart is empty.</h2>";
        updateTotals(0);
        return;
    }

    let subtotal = 0;
    let htmlContent = "";

    for (let i = 0; i < cartData.length; i++) {
        let item = cartData[i];
        console.log("5. Processing item:", item.name);
        
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
    console.log("6. Finished drawing the cart!");
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

// Start the process
loadCart();