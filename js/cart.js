var selectedEditColor = "";
var editingIndex = -1;

function loadCart() {
    // just in case
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

    const cartData = JSON.parse(localStorage.getItem('shoppingCart')) || [];

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
                <img src="${item.image}" width="100">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Color: ${item.color} | Length: ${item.length}"</p> 
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

function openEditModal(index) {
    let cartData = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    let item = cartData[index];
    if (!item) return;

    editingIndex = index;
    
    document.getElementById('edit-name').innerText = item.name;
    document.getElementById('edit-img').src = item.image;
    document.getElementById('edit-length').value = item.length;
    document.getElementById('edit-quantity').value = item.quantity;
    
    selectEditColor(item.color);
    
    document.getElementById('edit-modal').style.display = "block";
}

function selectEditColor(color) {
    selectedEditColor = color;
    var buttons = document.querySelectorAll('.q-color-btn');
    buttons.forEach(btn => {
        if(btn.innerText == color) {
            btn.style.border = "2px solid black";
        } else {
            btn.style.border = "1px solid #ccc";
        }
    });
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = "none";
}

function saveCartEdit() {
    let cartData = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (editingIndex > -1) {
        cartData[editingIndex].color = selectedEditColor;
        cartData[editingIndex].length = document.getElementById('edit-length').value;
        cartData[editingIndex].quantity = parseInt(document.getElementById('edit-quantity').value);
        
        localStorage.setItem('shoppingCart', JSON.stringify(cartData));
        closeEditModal();
        loadCart();
    }
}

function proceedToCheckout() {
    if (!window.Auth || !Auth.isLoggedIn()) {
        window.location.href = 'login.html?message=' + encodeURIComponent('Please log in to checkout.');
        return;
    }
    const cartData = JSON.parse(localStorage.getItem('shoppingCart')) || [];
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