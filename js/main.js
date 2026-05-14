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
    if (!grid) return; 

    grid.innerHTML = ""; 
    
    productsToDisplay.forEach(product => {
        var productCard = `
            <div class="product-card">
                <div class="image-container">
                    <div onclick="goToProduct(${product.id})" class="img-wrapper">
                        <img src="${product.mainImage}" alt="${product.name}">
                    </div>
                    
                    <div class="product-overlay-actions">
                        <button class="icon-btn purchase-btn" data-id="${product.id}" title="Add to Cart">
                            🛒
                        </button>
                        <button class="icon-btn wishlist-btn" title="Add to Wishlist">
                            ♡
                        </button>
                    </div>
                </div>

                <div class="product-info" onclick="goToProduct(${product.id})">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                </div>
            </div>
        `;
        grid.innerHTML += productCard;
    });

    grid.removeEventListener('click', productGridClickHandler);
    grid.addEventListener('click', productGridClickHandler);
}

// Ensure this function is defined globally in main.js
function goToProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function productGridClickHandler(e) {
    var target = e.target;
    // Only trigger if the actual Purchase button was clicked
    if (target.classList.contains('purchase-btn')) {
        var id = target.getAttribute('data-id');
        handlePurchase(id);
    }
}


function handlePurchase(id) {
    // require login
    if (!isUserLoggedIn()) {
        // redirect to login page
        window.location.href = 'login.html';
        return;
    }

    // proceed with purchase flow (demo)
    alert('Purchase successful for product id: ' + id + ' (demo)');
}

function isUserLoggedIn() {
    try {
        return !!localStorage.getItem('currentUser');
    } catch (e) { return false; }
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

var slideIndex = 1;
var timer;

//to be present initially
showSlides(slideIndex);
startTimer();

// next/prev mouvement
function moveSlide(n) {
    clearInterval(timer); // auto-slide stops when user clicks
    showSlides(slideIndex += n);
    startTimer(); // restart
}

// pagination dots
function currentSlide(n) {
    clearInterval(timer);
    showSlides(slideIndex = n);
    startTimer();
}

function showSlides(n) {
    var slides = document.getElementsByClassName("slide");
    var dots = document.getElementsByClassName("dot");
    
    if (n > slides.length) {
        slideIndex = 1
    }    
    if (n < 1) {
        slideIndex = slides.length
    }
    
    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    for (var i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    slides[slideIndex-1].style.display = "block";  
    dots[slideIndex-1].className += " active";
}

function startTimer() {
    timer = setInterval(function() {
        slideIndex++;
        showSlides(slideIndex);
    }, 5000); // every 5 seconds
}

loadProducts();