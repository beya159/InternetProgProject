const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

let currentProduct = null;
let selectedColor = "";
let currentQty = 1;

function loadProduct() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/products.json', true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var products = JSON.parse(xhr.responseText);
            currentProduct = products.find(function(p) {
                return p.id == productId;
            });

            if (currentProduct) {
                renderProduct(currentProduct);
            } else {
                var container = document.querySelector('.detail-container');
                if (container) container.innerHTML = "<h1>Product not found</h1>";
            }
        }
    };
    xhr.send();
}

function renderProduct(item) {
    document.getElementById('p-name').innerText = item.name;
    document.getElementById('p-price').innerText = `$${item.price.toFixed(2)}`;
    document.getElementById('p-desc').innerText = item.description;
    document.getElementById('primary-image').src = item.mainImage;

    const thumbDiv = document.getElementById('thumb-column');
    if (thumbDiv) {
        thumbDiv.innerHTML = ""; 
        const allImages = [item.mainImage, ...item.angles];

        allImages.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = "thumb-item";
            img.onclick = function() {
                document.getElementById('primary-image').src = imgSrc;
            };
            thumbDiv.appendChild(img);
        });
    }
}

function changeQty(amount) {
    currentQty += amount;
    if (currentQty < 1) {
        currentQty = 1;
    }
    document.getElementById('qty-count').innerText = currentQty;
}

function selectColor(color) {
    selectedColor = color;
    var errorMsg = document.getElementById('error-msg');
    if (errorMsg) errorMsg.style.display = "none";
    
    console.log("Color selected: " + selectedColor);
}

function handleAddToCart() {
    const lengthDropdown = document.getElementById('size-dropdown');
    const length = lengthDropdown ? lengthDropdown.value : "";
    const errorMsg = document.getElementById('error-msg');

    // SECURITY CHECK: This uses the Auth object from site-auth.js
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert("You must be logged in to add items to your cart.");
        window.location.href = 'login.html'; 
        return;
    }

    if (!selectedColor || !length) {
        if (errorMsg) {
            errorMsg.style.display = "block";
            errorMsg.innerText = "* PLEASE SELECT COLOR AND LENGTH BEFORE ADDING.";
        }
        return;
    }

    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.mainImage,
        color: selectedColor,
        length: length,
        quantity: currentQty
    };

    // Save to shopping cart
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    const existingIndex = cart.findIndex(item => 
        item.id == cartItem.id && 
        item.color == cartItem.color && 
        item.length == cartItem.length
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += currentQty;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    alert(`Success! ${currentQty} ${currentProduct.name}(s) added to cart.`);
    if (errorMsg) errorMsg.style.display = "none";
    
    // Optional: update cart badge in header if you have that logic
    if (typeof updateCartBadge === 'function') updateCartBadge();
}

// Kick off loading and UI updates
document.addEventListener('DOMContentLoaded', function() {
    loadProduct();
    if (window.Auth && typeof Auth.updateHeaderUI == 'function') {
        Auth.updateHeaderUI();
    }
});