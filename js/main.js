var allProducts = []; 
var selectedQuickColor = ""; 
var currentQuickProduct = null; // Track which product is in the modal

function loadProducts() {
    var request = new XMLHttpRequest();
    request.open('GET', 'data/products.json', true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            allProducts = JSON.parse(request.responseText);
            displayProducts(allProducts);
        }
    };
    request.send();
}

function displayProducts(productsToDisplay) {
    var grid = document.getElementById('product-grid'); 
    if (!grid) return; 
    grid.innerHTML = ""; 
    productsToDisplay.forEach(product => {
        grid.innerHTML += `
            <div class="product-card">
                <div class="image-container">
                    <div onclick="goToProduct(${product.id})" class="img-wrapper">
                        <img src="${product.mainImage}" alt="${product.name}">
                    </div>
                    <div class="product-overlay-actions">
                        <button class="shop-btn" onclick="openQuickShop(${product.id})">🛒</button>
                        <button class="icon-btn wishlist-btn" onclick="addToWishlist(${product.id})">♡</button>
                    </div>
                </div>
                <div class="product-info" onclick="goToProduct(${product.id})">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                </div>
            </div>`;
    });
}

function goToProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// --- QUICK SHOP FUNCTIONS (The missing pieces!) ---
function openQuickShop(productId) {
    // Find product in whichever list is active
    currentQuickProduct = allProducts.find(p => p.id == productId);
    
    if (!currentQuickProduct) return;

    // Fill modal data
    document.getElementById('quick-name').innerText = currentQuickProduct.name;
    document.getElementById('quick-price').innerText = `$${currentQuickProduct.price.toFixed(2)}`;
    document.getElementById('quick-img').src = currentQuickProduct.mainImage;
    
    // Reset selection and errors
    selectedQuickColor = "";
    document.getElementById('quick-error-msg').style.display = "none";
    
    // Show modal
    document.getElementById('quick-shop-modal').style.display = "block";
}

function closeQuickShop() {
    document.getElementById('quick-shop-modal').style.display = "none";
}

function selectQuickColor(color) {
    selectedQuickColor = color;
    document.getElementById('quick-error-msg').style.display = "none";
    console.log("Quick color selected: " + color);
}

// --- WISHLIST LOGIC ---
function addToWishlist(productId) {
    // 1. Check Login
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert("Please log in to save items to your wishlist!");
        window.location.href = 'login.html';
        return;
    }

    // 2. Find the product details from our loaded list
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;

    // 3. Get current wishlist or empty array
    let wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];

    // 4. Check if it's already there so we don't double up
    const exists = wishlist.some(item => item.id == productId);

    if (!exists) {
        wishlist.push(product);
        localStorage.setItem('userWishlist', JSON.stringify(wishlist));
        alert(`${product.name} added to your wishlist! ♡`);
    } else {
        alert("This item is already in your wishlist.");
    }
}

// --- CAROUSEL CODE ---
var slideIndex = 1;
var timer;

function moveSlide(n) {
    clearInterval(timer);
    showSlides(slideIndex += n);
    startTimer();
}

function showSlides(n) {
    var slides = document.getElementsByClassName("slide");
    var dots = document.getElementsByClassName("dot");
    if (slides.length == 0) return;
    if (n > slides.length) { slideIndex = 1; }    
    if (n < 1) { slideIndex = slides.length; }
    for (var i = 0; i < slides.length; i++) { slides[i].style.display = "none"; }
    for (var i = 0; i < dots.length; i++) { dots[i].className = dots[i].className.replace(" active", ""); }
    if (slides[slideIndex-1]) slides[slideIndex-1].style.display = "block";  
    if (dots[slideIndex-1]) dots[slideIndex-1].className += " active";
}

function startTimer() {
    var slides = document.getElementsByClassName("slide");
    if (slides.length == 0) return;
    timer = setInterval(function() {
        slideIndex++;
        showSlides(slideIndex);
    }, 5000);
}

// --- CART LOGIC ---
function addQuickToCart() {
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert("Please log in first!");
        window.location.href = 'login.html';
        return;
    }

    var length = document.getElementById('quick-length').value;
    var errorMsg = document.getElementById('quick-error-msg');

    if (!selectedQuickColor || !length) {
        errorMsg.innerText = "* PLEASE SELECT COLOR AND LENGTH.";
        errorMsg.style.display = "block";
        return;
    }

    const cartItem = {
        id: currentQuickProduct.id,
        name: currentQuickProduct.name,
        price: currentQuickProduct.price,
        image: currentQuickProduct.mainImage,
        color: selectedQuickColor,
        length: length,
        quantity: 1
    };

    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    cart.push(cartItem);
    localStorage.setItem('shoppingCart', JSON.stringify(cart));

    alert("Added to bag!");
    closeQuickShop();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    showSlides(slideIndex);
    startTimer();
    
    if (window.Auth && typeof Auth.updateHeaderUI == 'function') {
        Auth.updateHeaderUI();
    }
});