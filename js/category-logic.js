var categoryProducts = []; 
var currentPage = 1;
var itemsPerPage = 8;
var currentFilteredList = [];

function initCategoryPage() {
    var params = new URLSearchParams(window.location.search);
    //URLSearchParams = builtin class that parses URL strings
    var selectedCat = params.get('type');

    if (!selectedCat) {
        return;
    }

    var displayElem = document.getElementById('cat-name-display');
    if (displayElem){
        displayElem.innerText = selectedCat.toUpperCase();
    } 

    var request = new XMLHttpRequest();
    request.open('GET', '../data/products.json', true);
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

    // listeners for radio filters (Color, Style)
    document.querySelectorAll('input[type="radio"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            currentPage = 1;
            applyFilters();
        });
    });

    // listeners for dynamic range sliders (Price Range)
    var minSlider = document.getElementById('price-min');
    var maxSlider = document.getElementById('price-max');
    
    if (minSlider && maxSlider) {
        minSlider.addEventListener('input', updatePriceLabels);
        maxSlider.addEventListener('input', updatePriceLabels);
    }

    // listener for Sorting Dropdown
    var sortElem = document.getElementById('sort-price');
    if (sortElem) {
        sortElem.addEventListener('change', function() {
            currentPage = 1;
            applyFilters();
        });
    }

    if (window.Auth && typeof Auth.updateHeaderUI == 'function') {
        Auth.updateHeaderUI();
    }
}

// synchronizes labels visually and prevents sliders from bypassing each other
function updatePriceLabels() {
    var minSlider = document.getElementById('price-min');
    var maxSlider = document.getElementById('price-max');
    var minLabel = document.getElementById('min-label');
    var maxLabel = document.getElementById('max-label');

    var minVal = parseInt(minSlider.value) || 0;
    var maxVal = parseInt(maxSlider.value) || 0;

    // boundary protection logic
    if (minVal > maxVal) {
        minSlider.value = maxVal;
        minVal = maxVal;
    }

    if (minLabel) minLabel.innerText = minVal;
    if (maxLabel) maxLabel.innerText = maxVal;

    currentPage = 1; // reset to page 1 during filtering adjustments
    applyFilters();
}

function applyFilters() {
    var colorRadio = document.querySelector('input[name="color"]:checked');
    var styleRadio = document.querySelector('input[name="style"]:checked');
    var sortElem = document.getElementById('sort-price');
    
    var minSlider = document.getElementById('price-min');
    var maxSlider = document.getElementById('price-max');

    var selectedColor = colorRadio ? colorRadio.value : 'all';
    var selectedStyle = styleRadio ? styleRadio.value : 'all';
    var sortOrder = sortElem ? sortElem.value : 'default';
    
    // fallback ranges matching defaults set in HTML layout structure
    var minPrice = minSlider ? parseInt(minSlider.value) : 0;
    var maxPrice = maxSlider ? parseInt(maxSlider.value) : 500;

    var filtered = categoryProducts;

    // color Filtering Block
    if (selectedColor != 'all') {
        filtered = filtered.filter(function(p) {
            return p.color && p.color.toLowerCase() == selectedColor.toLowerCase();
        });
    }

    // style filtering block
    if (selectedStyle != 'all') {
        filtered = filtered.filter(function(p) {
            return p.style && p.style.toLowerCase() == selectedStyle.toLowerCase();
        });
    }

    // new Range Slider Price Filtering Block
    filtered = filtered.filter(function(p) {
        return p.price >= minPrice && p.price <= maxPrice;
    });

    // sort Ordering Sorting Execution
    if (sortOrder == "low-high") {
        filtered.sort((a, b) => a.price - b.price); 
    } else if (sortOrder == "high-low") {
        filtered.sort((a, b) => b.price - a.price);
    }

    currentFilteredList = filtered;
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    var paginatedProducts = filtered.slice(startIndex, endIndex);

    renderGrid(paginatedProducts);
    renderPaginationControls();
}

function renderGrid(products) {
    var grid = document.getElementById('product-grid');
    var countDisplay = document.getElementById('item-count');
    
    if (countDisplay){
        countDisplay.innerText = currentFilteredList.length + " ITEMS";
    } 
    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    products.forEach(function(p) {
        grid.innerHTML += `
            <div class="product-card">
                <div class="image-container">
                    <img src="../${p.mainImage}" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer">
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

function renderPaginationControls() {
    var container = document.getElementById('pagination-controls');
    if (!container) return;

    var totalPages = Math.ceil(currentFilteredList.length / itemsPerPage);
    container.innerHTML = "";

    if (totalPages <= 1) return;

    var html = "";
    var prevDisabled = (currentPage == 1) ? "disabled" : "";
    html += `<button class="page-btn nav-btn" ${prevDisabled} onclick="changePage(${currentPage - 1})">← Prev</button>`;

    for (var i = 1; i <= totalPages; i++) {
        var activeClass = (i == currentPage) ? "active-page" : "";
        html += `<button class="page-btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }

    var nextDisabled = (currentPage == totalPages) ? "disabled" : "";
    html += `<button class="page-btn nav-btn" ${nextDisabled} onclick="changePage(${currentPage + 1})">Next →</button>`;

    container.innerHTML = html;
}

function changePage(pageNumber) {
    currentPage = pageNumber;
    applyFilters();
    var grid = document.getElementById('product-grid');
    if (grid) {
        grid.scrollIntoView({ behavior: 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initCategoryPage();
    
    var checkData = setInterval(function() {
        if (categoryProducts.length > 0) {
            window.allProducts = categoryProducts; 
            clearInterval(checkData);
        }
    }, 100);
});