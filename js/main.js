var allProducts = []; // to store products

function loadProducts() {
    var request = new XMLHttpRequest();

    request.open('GET', 'data/products.json', true);

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            allProducts = JSON.parse(request.responseText); //txt string to json
            
            console.log("Products loaded via request:", allProducts); //test

            displayProducts(allProducts);
        } else if (request.readyState == 4 && request.status != 200) {
            console.error("Error: Could not load JSON file.");
        }
    };
    request.send();
}

function displayProducts(productsToDisplay) {
    var grid = document.getElementById('product-grid'); 
    if (!grid) {
        return; 
    } 

    grid.innerHTML = ""; 
    
    productsToDisplay.forEach(product => {
        var productCard = `
            <div class="product-card">
                <img src="${product.mainImage}" alt="${product.name}" style="width:100%">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
            </div>
        `;
        grid.innerHTML += productCard;
    });
}

function filterByCategory(categoryName) {
    if (!allProducts || allProducts.length == 0) {
        console.log("Products haven't loaded yet!");
        return;
    }

    var titleElement = document.getElementById('category-title');
    if (titleElement) {
        titleElement.innerText = categoryName.toUpperCase();
    }

    if (categoryName == 'all') {
        displayProducts(allProducts);
    } else {
        var filtered = allProducts.filter(function(p) {
            return p.category == categoryName;
        });
        displayProducts(filtered);
    }
}

loadProducts();