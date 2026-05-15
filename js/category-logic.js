var categoryProducts = []; 

function initCategoryPage() {
    var params = new URLSearchParams(window.location.search);
    var selectedCat = params.get('type');

    if (!selectedCat) return;

    document.getElementById('cat-name-display').innerText = selectedCat.toUpperCase();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/products.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var allData = JSON.parse(xhr.responseText);
            
            categoryProducts = allData.filter(function(p) {
                return p.category.toLowerCase() === selectedCat.toLowerCase();
            });

            applyFilters(); // Use applyFilters instead of renderGrid to catch default sorts
        }
    };
    xhr.send();

    // Listen for Radio changes (Color/Style)
    document.querySelectorAll('input[type="radio"]').forEach(function(radio) {
        radio.addEventListener('change', applyFilters);
    });

    // NEW: Listen for Sort changes
    document.getElementById('sort-price').addEventListener('change', applyFilters);
}

function loadCategoryData(category) {
                applyFilters(); 
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/products.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var allData = JSON.parse(xhr.responseText);

            // filter for the category first (e.g., just Rings)
            categoryProducts = allData.filter(p => 
                p.category.toLowerCase() == category.toLowerCase()
            );

            // call the filter logic immediately after data arrives
            applyFilters(); 
        }
    };
    xhr.send();
}

function applyFilters() {
    var selectedColor = document.querySelector('input[name="color"]:checked').value;
    var selectedStyle = document.querySelector('input[name="style"]:checked').value;
    var sortOrder = document.getElementById('sort-price').value; // Get the sort value

    var filtered = categoryProducts;

    if (selectedColor !== 'all') {
        filtered = filtered.filter(function(p) {
            return p.color && p.color.toLowerCase() === selectedColor.toLowerCase();
        });
    }

    if (selectedStyle !== 'all') {
        filtered = filtered.filter(function(p) {
            return p.style && p.style.toLowerCase() === selectedStyle.toLowerCase();
        });
    }

    if (sortOrder === "low-high") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "high-low") {
        filtered.sort((a, b) => b.price - a.price);
    }

    renderGrid(filtered);
}

function renderGrid(products) {
    var grid = document.getElementById('product-grid');
    var countDisplay = document.getElementById('item-count');
    
    if (countDisplay) countDisplay.innerText = products.length + " ITEMS";
    if (!grid) return;

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

// Start the engine
initCategoryPage();