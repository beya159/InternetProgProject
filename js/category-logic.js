var categoryProducts = []; // To store products of the current category

function initCategoryPage() {
    var params = new URLSearchParams(window.location.search);
    var selectedCat = params.get('type');

    if (selectedCat) {
        document.getElementById('cat-name-display').innerText = selectedCat.toUpperCase();
        loadCategoryData(selectedCat);
    }
    
    // Add event listeners to radio buttons
    document.querySelectorAll('input[name="color"], input[name="style"]').forEach(input => {
        input.addEventListener('change', applyFilters);
    });
}

function loadCategoryData(category) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/products.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var allData = JSON.parse(xhr.responseText);
            
            // Initial filter by category
            categoryProducts = allData.filter(p => 
                p.category.toLowerCase() === category.toLowerCase()
            );

            renderGrid(categoryProducts);
        }
    };
    xhr.send();
}

function applyFilters() {
    const selectedColor = document.querySelector('input[name="color"]:checked')?.value;
    const selectedStyle = document.querySelector('input[name="style"]:checked')?.value;

    let filtered = categoryProducts;

    if (selectedColor) {
        filtered = filtered.filter(p => p.color && p.color.toLowerCase() === selectedColor);
    }

    if (selectedStyle && selectedStyle !== 'all') {
        filtered = filtered.filter(p => p.style && p.style.toLowerCase() === selectedStyle);
    }

    renderGrid(filtered);
}

function renderGrid(products) {
    var grid = document.getElementById('product-grid');
    document.getElementById('item-count').innerText = products.length + " ITEMS";
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
                <div class="product-info" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer">
                    <h3>${p.name}</h3>
                    <p>$${p.price.toFixed(2)}</p>
                </div>
            </div>`;
    });
}

initCategoryPage();