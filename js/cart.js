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
let currentQuickProduct = null;
function openQuickShop(id) {
    // 1. Reset any previous validation messages/states
    selectedQuickColor = "";
    document.getElementById('quick-error-msg').style.display = "none";
    document.getElementById('quick-length').value = "";
    
    // Remove "active" borders from all color selection buttons
    var buttons = document.querySelectorAll('.q-color-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 2. Find the product inside your existing loaded global product array 
    // (Assuming your array is named allProducts or products)
    currentQuickProduct = allProducts.find(p => p.id == id);
    
    if (!currentQuickProduct) return;

    // 3. Inject data into modal elements
    document.getElementById('quick-name').innerText = currentQuickProduct.name;
    document.getElementById('quick-price').innerText = `$${currentQuickProduct.price.toFixed(2)}`;
    document.getElementById('quick-img').src = currentQuickProduct.mainImage;
    
    // 4. Reveal the modal on screen
    document.getElementById('quick-shop-modal').style.display = "block";
}

function closeQuickShop() {
    document.getElementById('quick-shop-modal').style.display = "none";
}

function selectQuickColor(color) {
    selectedQuickColor = color;
    document.getElementById('quick-error-msg').style.display = "none";
    
    // Toggle active design styles visually on the button choice
    var buttons = document.querySelectorAll('.q-color-btn');
    buttons.forEach(btn => {
        if(btn.innerText === color) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function addQuickToCart() {
    const length = document.getElementById('quick-length').value;
    const errorMsg = document.getElementById('quick-error-msg');

    // 1. INTEGRATION CHECK: Use your teammate's cookie login system guard
    if (!Auth.isLoggedIn()) {
        alert("Please log in first to add items to your cart!");
        window.location.href = 'login.html';
        return;
    }

    // 2. VALIDATION CHECK: Make sure selections are complete
    if (!selectedQuickColor || !length) {
        errorMsg.style.display = "block";
        errorMsg.innerText = "* Please select both a color and chain length.";
        return;
    }

    // 3. CART OBJECT GENERATION: Defaulting quick quantity purchase to 1 item
    const cartItem = {
        id: currentQuickProduct.id,
        name: currentQuickProduct.name,
        price: currentQuickProduct.price,
        image: currentQuickProduct.mainImage,
        color: selectedQuickColor,
        length: length,
        quantity: 1 
    };

    // 4. PERSIST TO STORAGE: Fetch cart array, push item, save back
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    const existingIndex = cart.findIndex(item => 
        item.id === cartItem.id && 
        item.color === cartItem.color && 
        item.length === cartItem.length
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    // 5. SUCCESS: Let the user know and close the prompt view
    alert(`Added 1 ${currentQuickProduct.name} (${selectedQuickColor}, ${length}") to your cart!`);
    closeQuickShop();
}
// Start the process
loadCart();