var editingIndex = -1;

function loadCart() {
    var user = null;
    if (window.Auth) {
        if (typeof Auth.getUser == 'function') {
            user = Auth.getUser();
        } else if (typeof Auth.currentUser == 'function') {
            user = Auth.currentUser();
        }
    }
    
    if (!user) {
        var container = document.querySelector('.cart-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding:50px;">
                    <h2>Access Denied</h2>
                    <p>Please <a href="login.html">log in</a> to view your shopping bag.</p>
                </div>
            `;
        }
        return; 
    }

    const cartWrapper = document.getElementById('cart-items-list');
    if (!cartWrapper) return;

    const cartData = getCookie('shoppingCart') || [];

    if (cartData.length == 0) {
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
                <img src="../${item.image}" width="100">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Color: ${item.color} | Length: ${item.length}${item.length !== "N/A" ? '"' : ''}</p> 
                    <p>Quantity: ${item.quantity}</p>
                    <div class="cart-item-actions">
                        <button onclick="openEditModal(${i})">Edit</button>
                        <button onclick="removeItem(${i})">Delete</button>
                    </div>
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
    const taxEl = document.getElementById('tax-amount');
    const totalEl = document.getElementById('final-total');

    var calculatedTax = subtotal * 0.15;
    var combinedTotal = subtotal + calculatedTax;

    if(subEl) subEl.innerText = "$" + subtotal.toFixed(2);
    if(taxEl) taxEl.innerText = "$" + calculatedTax.toFixed(2);
    if(totalEl) totalEl.innerText = "$" + combinedTotal.toFixed(2);
}

function removeItem(index) {
    let cartData = getCookie('shoppingCart') || [];
    cartData.splice(index, 1);
    
    setCookie('shoppingCart', cartData, 7); 
    updateCartBadge();                      
    loadCart();                             
}

function openEditModal(index) {
    let cartData = getCookie('shoppingCart') || [];
    let item = cartData[index];
    if (!item) return;

    editingIndex = index;
    
    if (document.getElementById('edit-name')) document.getElementById('edit-name').innerText = item.name;
    if (document.getElementById('edit-price')) document.getElementById('edit-price').innerText = `$${item.price.toFixed(2)}`;
    if (document.getElementById('edit-img')) document.getElementById('edit-img').src = "../" + item.image;
    if (document.getElementById('edit-length')) document.getElementById('edit-length').value = item.length;
    if (document.getElementById('edit-quantity')) document.getElementById('edit-quantity').value = item.quantity;
    
    var lengthArea = document.getElementById('edit-length-area');
    if (lengthArea) {
        var isChain = item.length !== "N/A" && item.length !== "" || item.name.toLowerCase().includes("chain");
        lengthArea.style.display = isChain ? "block" : "none";
    }
    
    var modalElement = document.getElementById('edit-modal');
    if (modalElement) {
        modalElement.style.display = "flex";
    }
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = "none";
}

function saveCartEdit() {
    let cartData = getCookie('shoppingCart') || [];
    if (editingIndex > -1 && cartData[editingIndex]) {
        var lengthDropdown = document.getElementById('edit-length');
        var lengthValue = lengthDropdown ? lengthDropdown.value : "N/A";
        var lengthArea = document.getElementById('edit-length-area');
        var errorMsg = document.getElementById('edit-error-msg');

        if (lengthArea && lengthArea.style.display == "block" && (!lengthValue || lengthValue == "N/A")) {
            if (errorMsg) {
                errorMsg.innerText = "* PLEASE SELECT A CHAIN LENGTH BEFORE UPDATING.";
                errorMsg.style.display = "block";
            }
            return;
        }

        cartData[editingIndex].length = lengthValue;
        cartData[editingIndex].quantity = parseInt(document.getElementById('edit-quantity').value) || 1;
        
        setCookie('shoppingCart', cartData, 7);
        updateCartBadge(); 
        closeEditModal();
        loadCart();
    }
}

function proceedToCheckout() {
    if (!window.Auth || !Auth.isLoggedIn()) {
        window.location.href = 'login.html?message=' + encodeURIComponent('Please log in to checkout.');
        return;
    }
    const cartData = getCookie('shoppingCart') || [];
    if (cartData.length == 0) {
        alert('Your cart is empty.');
        return;
    }
    window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    if (window.Auth && typeof Auth.updateHeaderUI == 'function') {
        Auth.updateHeaderUI();
    }
});

function adjustEditQty(amount) {
    var qtyInput = document.getElementById('edit-quantity');
    if (!qtyInput) return;
    var currentVal = parseInt(qtyInput.value) || 1;
    var newVal = currentVal + amount;
    if (newVal >= 1) {
        qtyInput.value = newVal;
    }
}