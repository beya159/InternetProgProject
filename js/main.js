//starting point for the whole index.html

var allProducts = []; // Stores the product inventory array
var selectedQuickColor = ""; // Captures the modal color picker choice

function loadProducts() {
    var request = new XMLHttpRequest();
    request.open('GET', 'data/products.json', true);

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            allProducts = JSON.parse(request.responseText); // text string to JSON array
            console.log("Products loaded via request:", allProducts); 
            displayProducts(allProducts);
        } else if (request.readyState == 4 && request.status != 200) {
            console.error("Error: Could not load JSON file.");
        }
    };
    request.send();
}

// produc grid layiut
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
                        <button class="shop-btn" onclick="openQuickShop(${product.id})" title="Quick Shop">
                            🛒
                        </button>
                        <button class="icon-btn wishlist-btn" onclick="addToWishlist(${product.id})" title="Add to Wishlist">
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
}


function goToProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
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

// 3. for quick shop btn
let tempQuickProduct = null;

function openQuickShop(id) {
    // 1. Find product
    tempQuickProduct = allProducts.find(p => p.id == id);
    if (!tempQuickProduct) return;

    // 2. Fill info (Make sure these IDs are in your HTML!)
    document.getElementById('quick-name').innerText = tempQuickProduct.name;
    document.getElementById('quick-price').innerText = "$" + tempQuickProduct.price.toFixed(2);
    document.getElementById('quick-img').src = tempQuickProduct.mainImage;

    // 3. Show it
    document.getElementById('quick-shop-modal').style.display = "block";
}

function closeQuickShop() {
    document.getElementById('quick-shop-modal').style.display = "none";
}

function selectQuickColor(color) {
    selectedQuickColor = color;
    var errorBox = document.getElementById('quick-error-msg');
    if(errorBox) errorBox.style.display = "none";
    
    var buttons = document.querySelectorAll('.q-color-btn');
    buttons.forEach(btn => {
        if(btn.innerText == color) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function addQuickToCart() {
    const lengthDropdown = document.getElementById('quick-length');
    const length = lengthDropdown ? lengthDropdown.value : "";
    const errorMsg = document.getElementById('quick-error-msg');

    // 1. dannush's cookie session integration gate
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert("Please log in first to access your shopping cart!");
        window.location.href = 'login.html';
        return;
    }

    if (!selectedQuickColor || !length) {
        if (errorMsg) {
            errorMsg.style.display = "block";
            errorMsg.innerText = "* Please specify both your preferred color and chain length selection.";
        } else {
            alert("Please pick a color and length option first!");
        }
        return;
    }

    // localStorage 
    const cartItem = {
        id: tempQuickProduct.id,
        name: tempQuickProduct.name,
        price: tempQuickProduct.price,
        image: tempQuickProduct.mainImage,
        color: selectedQuickColor,
        length: length,
        quantity: 1 
    };

    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    const existingIndex = cart.findIndex(item => 
        item.id == cartItem.id && 
        item.color == cartItem.color && 
        item.length == cartItem.length
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    alert(`Success! 1 ${tempQuickProduct.name} (${selectedQuickColor}, ${length}") added to your shopping bag.`);
    closeQuickShop();
}

// caroussel
var slideIndex = 1;
var timer;

// Initial carousel startup procedures
showSlides(slideIndex);
startTimer();

function moveSlide(n) {
    clearInterval(timer); // auto-slide stops when user interacts
    showSlides(slideIndex += n);
    startTimer(); // tracking timeline resets
}

function currentSlide(n) {
    clearInterval(timer);
    showSlides(slideIndex = n);
    startTimer();
}

function showSlides(n) {
    var slides = document.getElementsByClassName("slide");
    var dots = document.getElementsByClassName("dot");
    
    if (slides.length == 0) return; // prevent crashes if page lacks carousel structures
    
    if (n > slides.length) { slideIndex = 1; }    
    if (n < 1) { slideIndex = slides.length; }
    
    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    for (var i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    if (slides[slideIndex-1]) slides[slideIndex-1].style.display = "block";  
    if (dots[slideIndex-1]) dots[slideIndex-1].className += " active";
}

function startTimer() {
    var slides = document.getElementsByClassName("slide");
    if (slides.length == 0) return;

    timer = setInterval(function() {
        slideIndex++;
        showSlides(slideIndex);
    }, 5000); // 5 second intervals
}

function addToWishlist(id) {
    //Check Login (Using danush's Auth gate)
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert("Please log in to save items to your wishlist! ♡");
        window.location.href = 'login.html';
        return;
    }

    const product = allProducts.find(p => p.id == id);
    let wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];
    const exists = wishlist.some(item => item.id == id);

    if (exists) {
        alert("This item is already in your wishlist!");
    } else {
        wishlist.push(product);
        localStorage.setItem('userWishlist', JSON.stringify(wishlist));
        alert(`${product.name} added to your wishlist!`);
    }
}

loadProducts();