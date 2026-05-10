var allProducts = [];

function initCategoryPage() {
    var params = new URLSearchParams(window.location.search);
    var selectedCat = params.get('type'); // Gets "rings" or "chains"

    if (selectedCat) {
        document.getElementById('cat-name-display').innerText = selectedCat;
        loadCategoryData(selectedCat);
    }
}

function loadCategoryData(category) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/products.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            
            // Filter products to ONLY show the selected category
            var filtered = data.filter(function(p) {
                return p.category.toLowerCase() === category.toLowerCase();
            });

            document.getElementById('item-count').innerText = filtered.length + " ITEMS";
            renderGrid(filtered);
        }
    };
    xhr.send();
}

function renderGrid(products) {
    var grid = document.getElementById('product-grid');
    grid.innerHTML = "";
    products.forEach(function(p) {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${p.mainImage}" style="width:100%">
                <h3>${p.name}</h3>
                <p>$${p.price}</p>
            </div>`;
    });
}

initCategoryPage();