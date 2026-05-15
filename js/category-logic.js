var categoryProducts = []; 

function initCategoryPage() {
    var params = new URLSearchParams(window.location.search);
    var selectedCat = params.get('type');

    if (!selectedCat) {
        return;
    }

    var displayElem = document.getElementById('cat-name-display');
    if (displayElem){
        displayElem.innerText = selectedCat.toUpperCase();
    } 

    var request = new XMLHttpRequest();
    request.open('GET', 'data/products.json', true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            var allData = JSON.parse(request.responseText);
            
            if (selectedCat.toLowerCase() == "all") {
                categoryProducts = allData;
            } else {
                categoryProducts = allData.filter(function(p) {
                    return p.category.toLowerCase() == selectedCat.toLowerCase();
                });
            }
            applyFilters();
        }
    };
    request.send();

    document.querySelectorAll('input[type="radio"]').forEach(function(radio) {
        radio.addEventListener('change', applyFilters);
    });

    var sortElem = document.getElementById('sort-price');
    if (sortElem) {
        sortElem.addEventListener('change', applyFilters);
    }

    if (window.Auth && typeof Auth.updateHeaderUI == 'function') {
        Auth.updateHeaderUI();
    }
}

function applyFilters() {
    var colorRadio = document.querySelector('input[name="color"]:checked');
    var styleRadio = document.querySelector('input[name="style"]:checked');
    var sortElem = document.getElementById('sort-price');

    var selectedColor = colorRadio ? colorRadio.value : 'all';
    var selectedStyle = styleRadio ? styleRadio.value : 'all';
    var sortOrder = sortElem ? sortElem.value : 'default';

    var filtered = categoryProducts;

    if (selectedColor != 'all') {
        filtered = filtered.filter(function(p) {
            return p.color && p.color.toLowerCase() == selectedColor.toLowerCase();
        });
    }

    if (selectedStyle != 'all') {
        filtered = filtered.filter(function(p) {
            return p.style && p.style.toLowerCase() == selectedStyle.toLowerCase();
        });
    }

    if (sortOrder == "low-high") {
        filtered.sort((a, b) => a.price - b.price); //like javaa
    } else if (sortOrder == "high-low") {
        filtered.sort((a, b) => b.price - a.price);
    }

    renderGrid(filtered);
}

function renderGrid(products) {
    var grid = document.getElementById('product-grid');
    var countDisplay = document.getElementById('item-count');
    
    if (countDisplay){
        countDisplay.innerText = products.length + " ITEMS";
    } 
    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    products.forEach(function(p) {
        grid.innerHTML += `
            <div class="product-card">
                <div class="image-container">
                    <img src="${p.mainImage}" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer">
                    <div class="product-overlay-actions">
                        <button class="shop-btn" onclick="openQuickShop(${p.id})">🛒</button>
                        <button class="icon-btn wishlist-btn" onclick="addToWishlist(${p.id})">♡</button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>$${p.price.toFixed(2)}</p>
                </div>
            </div>`;
    });
}

// Ensure category products are shared with the global allProducts if needed
document.addEventListener('DOMContentLoaded', function() {
    initCategoryPage();
    
    // This bridges the gap so openQuickShop in main.js can find the data
    var checkData = setInterval(function() {
        if (categoryProducts.length > 0) {
            window.allProducts = categoryProducts; 
            clearInterval(checkData);
        }
    }, 100);
});