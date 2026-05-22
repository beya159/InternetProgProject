const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

let currentProduct = null;
let selectedColor = "";
let currentQty = 1;

function loadProduct() {
    var request = new XMLHttpRequest();
    request.open('GET', '../data/products.json', true);

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            var products = JSON.parse(request.responseText);
            currentProduct = products.find(function(p) {
                return p.id == productId;
            });

            if (currentProduct) {
                renderProduct(currentProduct);
                loadRelatedProducts(products, currentProduct);
                loadReviews();
            } else {
                var container = document.querySelector('.detail-container');
                if (container) {
                    container.innerHTML = "<h1>Product not found</h1>";
                }
            }
        }
    };
    request.send();
}

function renderProduct(item) {
    document.getElementById('p-name').innerText = item.name;
    document.getElementById('p-price').innerText = `$${item.price.toFixed(2)}`;
    document.getElementById('p-desc').innerText = item.description;
    document.getElementById('primary-image').src = "../" + item.mainImage;

    if (document.getElementById('p-sku')) {
        document.getElementById('p-sku').innerText = item.sku || `JW-${item.id}`;
    }

    var availEl = document.getElementById('p-availability');
    var cartBtn = document.getElementById('p-submit-btn');
    if (availEl && cartBtn) {
        if (item.availability == false || item.availability == "Out of Stock" || item.stock == 0) {
            availEl.innerText = "OUT OF STOCK";
            availEl.style.color = "red";
            cartBtn.innerText = "OUT OF STOCK";
            cartBtn.disabled = true;
            cartBtn.style.backgroundColor = "#ccc";
            cartBtn.style.cursor = "not-allowed";
        } else {
            availEl.innerText = "IN STOCK";
            availEl.style.color = "green";
        }
    }

    // chain length section strictly for chains
    var lengthSection = document.getElementById('length-section-wrapper');
    if (lengthSection) {
        var isChain = (item.category && item.category.toLowerCase() == "chains") || 
                      (item.type && item.type.toLowerCase() == "chains") || 
                      (item.name && item.name.toLowerCase().includes("chain"));
        
        lengthSection.style.display = isChain ? "block" : "none";
    }

    const thumbDiv = document.getElementById('thumb-column');
    if (thumbDiv) {
        thumbDiv.innerHTML = ""; 
        const allImages = [item.mainImage, ...item.angles];

        allImages.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = "../" + imgSrc;
            img.className = "thumb-item";
            img.onclick = function() {
                document.getElementById('primary-image').src = "../" + imgSrc;
            };
            thumbDiv.appendChild(img);
        });
    }
}

function loadRelatedProducts(allProducts, currentItem) {
    var relatedGrid = document.getElementById('related-grid');
    if (!relatedGrid) return;

    var matches = allProducts.filter(p => p.category == currentItem.category && p.id !== currentItem.id).slice(0, 4);
    relatedGrid.innerHTML = "";

    if (matches.length == 0) {
        matches = allProducts.filter(p => p.id !== currentItem.id).slice(0, 4);
    }

    matches.forEach(p => {
        relatedGrid.innerHTML += `
            <div class="product-card">
                <div class="image-container">
                    <img src="../${p.mainImage}" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>$${p.price.toFixed(2)}</p>
                </div>
            </div>`;
    });
}

function loadReviews() {
    var container = document.getElementById('reviews-container');
    var summaryEl = document.getElementById('p-rating-summary');
    if (!container) return;

    var request = new XMLHttpRequest();
    request.open('GET', '../data/reviews.json', true);
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            var allReviews = JSON.parse(request.responseText);
            var itemReviews = allReviews.filter(r => r.productId == productId);

            if (itemReviews.length == 0) {
                container.innerHTML = "<p>No reviews yet for this item.</p>";
                if (summaryEl) summaryEl.innerText = "★★★★★ (0 Reviews)";
                return;
            }

            var totalStars = itemReviews.reduce((sum, r) => sum + r.rating, 0);
            var avgStars = (totalStars / itemReviews.length).toFixed(1);
            if (summaryEl) summaryEl.innerText = `★ ${avgStars} (${itemReviews.length} Reviews)`;

            var html = "";
            itemReviews.forEach(r => {
                var starsStr = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
                html += `
                    <div class="review-item" style="margin-bottom: 20px; border-bottom: 1px dashed #eee; padding-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between;">
                            <strong>${r.username || r.author}</strong>
                            <span style="color: #ffb703;">${starsStr}</span>
                        </div>
                        <p style="margin: 5px 0;">"${r.comment || r.text}"</p>
                        <small style="color: #999;">${r.date || '2026-05-22'}</small>
                    </div>`;
            });
            container.innerHTML = html;
        }
    };
    request.send();
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
    if (errorMsg) {
        errorMsg.style.display = "none";
    }
}

function handleAddToCart() {
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert("Please log in to add items to your shopping bag.");
        window.location.href = 'login.html';
        return;
    }

    if (!currentProduct) return;

    if (currentProduct.availability == false || currentProduct.availability == "Out of Stock") {
        alert("Sorry, this item is out of stock.");
        return;
    }

    var sizeDropdown = document.getElementById('size-dropdown');
    var selectedLength = sizeDropdown ? sizeDropdown.value : "";
    var errorMsg = document.getElementById('error-msg');

    var isChain = (currentProduct.category && currentProduct.category.toLowerCase() == "chains") || 
                  (currentProduct.type && currentProduct.type.toLowerCase() == "chains") || 
                  (currentProduct.name && currentProduct.name.toLowerCase().includes("chain"));

    if (isChain && !selectedLength) {
        if (errorMsg) {
            errorMsg.innerText = "* PLEASE SELECT A CHAIN LENGTH BEFORE PURCHASING.";
            errorMsg.style.display = "block";
        }
        return;
    }

    var quantity = parseInt(document.getElementById('qty-count').innerText) || 1;
    var finalLength = isChain ? selectedLength : "N/A";

    let cart = getCookie('shoppingCart') || [];
    
    var existingItem = cart.find(item => item.id == currentProduct.id && item.length == finalLength);

    if (existingItem) {
        existingItem.quantity += quantity; 
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.mainImage,
            color: selectedColor || "Standard", 
            length: finalLength,
            quantity: quantity
        }); 
    }

    setCookie('shoppingCart', cart, 7);
    updateCartBadge();

    if (window.Auth && typeof Auth.updateHeaderUI == 'function') {
        Auth.updateHeaderUI();
    }

    alert(quantity + "x " + currentProduct.name + " added to your shopping bag! 🛒");
    if (errorMsg) errorMsg.style.display = "none";
}

function handleAddToWishlist() {
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert("Please log in to manage your wishlist profile.");
        window.location.href = 'login.html';
        return;
    }

    if (!currentProduct) return;

    var wishlistItems = [];
    var match = document.cookie.match(/(^| )jewelry_wishlist=([^;]+)/);
    if (match) {
        try {
            wishlistItems = JSON.parse(decodeURIComponent(match[2]));
        } catch (e) {
            wishlistItems = [];
        }
    }

    var isAlreadyInWishlist = wishlistItems.some(function(item) {
        return item.id == currentProduct.id;
    });

    if (isAlreadyInWishlist) {
        alert(currentProduct.name + " is already saved in your wishlist! ♡");
        return;
    }

    wishlistItems.push({
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.mainImage,
        color: selectedColor || "Standard",
        addedAt: new Date().toISOString()
    });

    var cookieValue = encodeURIComponent(JSON.stringify(wishlistItems));
    document.cookie = "jewelry_wishlist=" + cookieValue + "; path=/; max-age=" + (30 * 24 * 60 * 60);

    alert(currentProduct.name + " has been added to your wishlist! ♡");
}

document.addEventListener('DOMContentLoaded', function() {
    loadProduct();
    if (window.Auth && typeof Auth.updateHeaderUI == 'function') {
        Auth.updateHeaderUI();
    }

    var wishlistBtn = document.getElementById('detail-wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', handleAddToWishlist);
    }
});