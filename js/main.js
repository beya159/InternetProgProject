var allProducts = []; 
var productNames = []; // added to store names for autocomplete
var selectedQuickColor = ""; 
var currentQuickProduct = null; // to track which product is in the modal

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) {
            try {
                return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
            } catch (e) {
                return null;
            }
        }
    }
    return null;
}

function updateCartBadge() {
    var badge = document.getElementById("cart-badge");
    if (!badge) return;

    var cart = getCookie("shoppingCart") || [];
    var totalItems = 0;

    for (var i = 0; i < cart.length; i++) {
        totalItems += parseInt(cart[i].quantity) || 1;
    }

    badge.textContent = totalItems;
}

function loadProducts() {
    var request = new XMLHttpRequest();
    request.open('GET', '../data/products.json', true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            allProducts = JSON.parse(request.responseText);
            
            productNames = [];
            for (var i = 0; i < allProducts.length; i++) {
                productNames.push(allProducts[i].name);
            }
            
            displayProducts(allProducts);
        }
    };
    request.send();
}

function auto_complete_products(obj) {
    var autocompleteDiv = document.querySelector("#autocomplete");
    var autocompleteList = document.querySelector("#autocomplete > ul");
    var val = obj.value;

    autocompleteDiv.setAttribute("class", "autocomplete");
    autocompleteList.innerHTML = "";

    if (val.length == 0) {
        autocompleteDiv.setAttribute("class", "hidden");
        return;
    }

    for (var i = 0; i < productNames.length; i++) {
        if (productNames[i].slice(0, val.length).toLowerCase() == val.toLowerCase()) {
            
            var matchedProduct = allProducts.find(function(p) {
                return p.name == productNames[i];
            });

            var targetId = matchedProduct ? matchedProduct.id : null;

            if (targetId) {
                autocompleteList.innerHTML += "<li style='cursor: pointer;' onclick='goToProduct(" + targetId + ");'>" + productNames[i] + "</li>";
            } else {
                autocompleteList.innerHTML += "<li style='cursor: pointer;'>" + productNames[i] + "</li>";
            }
        }
    }
}

function fillSearchText(li) {
    document.querySelector("#global-search").value = li.innerHTML;
    document.querySelector("#autocomplete").setAttribute("class", "hidden");
}

function displayProducts(productsToDisplay) {
    var grid = document.getElementById('product-grid'); 
    if (!grid) {
        return; 
    }
    grid.innerHTML = ""; 
    productsToDisplay.forEach(product => {
        grid.innerHTML += `
            <div class="product-card">
                <div class="image-container">
                    <div onclick="goToProduct(${product.id})" class="img-wrapper">
                        <img src="../${product.mainImage}" alt="${product.name}">
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
//quic shop modal
function adjustQuickQty(amount) {
    var qtyInput = document.getElementById('quick-quantity');
    if (!qtyInput) return;
    var currentVal = parseInt(qtyInput.value) || 1;
    var newVal = currentVal + amount;
    if (newVal >= 1) {
        qtyInput.value = newVal;
    }
}

function openQuickShop(productId) {
    currentQuickProduct = allProducts.find(p => p.id == productId);
    
    if (!currentQuickProduct) {
        return;
    }

    document.getElementById('quick-name').innerText = currentQuickProduct.name;
    document.getElementById('quick-price').innerText = `$${currentQuickProduct.price.toFixed(2)}`;
    document.getElementById('quick-img').src = "../" + currentQuickProduct.mainImage;
    
    document.getElementById('quick-error-msg').style.display = "none";
    document.getElementById('quick-error-msg').innerText = "";
    
    // reset quantity inputs back down to 1 every single time a fresh product opens
    if (document.getElementById('quick-quantity')) {
        document.getElementById('quick-quantity').value = 1;
    }

    var colorArea = document.getElementById('quick-color-area');
    if (colorArea) {
        colorArea.style.display = "none";
    }

    var lengthArea = document.getElementById('quick-length-area');
    var lengthDropdown = document.getElementById('quick-length');
    
    var isChainItem = currentQuickProduct.category == "chains" || 
                      currentQuickProduct.type == "chains" || 
                      currentQuickProduct.name.toLowerCase().includes("chain");

    if (lengthArea && lengthDropdown) {
        if (isChainItem) {
            lengthArea.style.display = "block";
            lengthDropdown.value = ""; 
        } else {
            lengthArea.style.display = "none";
            if (!lengthDropdown.querySelector('option[value="N/A"]')) {
                lengthDropdown.innerHTML += `<option value="N/A">N/A</option>`;
            }
            lengthDropdown.value = "N/A"; 
        }
    }
    
    document.getElementById('quick-shop-modal').style.display = "flex";
}

function closeQuickShop() {
    document.getElementById('quick-shop-modal').style.display = "none";
}

function selectQuickColor(color) {
    selectedQuickColor = color;
    console.log("Color choice bypassed to: " + color);
}

function addQuickToCart() {
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert("Please log in first!");
        window.location.href = 'login.html';
        return;
    }

    var lengthDropdown = document.getElementById('quick-length');
    var lengthValue = lengthDropdown ? lengthDropdown.value : "N/A";
    var errorMsg = document.getElementById('quick-error-msg');
    
    // read the user selection quantity instead of forcing a 1
    var qtyInput = document.getElementById('quick-quantity');
    var selectQtyCount = qtyInput ? parseInt(qtyInput.value) : 1;

    var isChainItem = currentQuickProduct.category == "chains" || 
                      currentQuickProduct.type == "chains" || 
                      currentQuickProduct.name.toLowerCase().includes("chain");

    if (isChainItem && (!lengthValue || lengthValue == "N/A")) {
        errorMsg.innerText = "* PLEASE SELECT A CHAIN LENGTH BEFORE ADDING TO BAG.";
        errorMsg.style.display = "block";
        return;
    }

    var cart = getCookie('shoppingCart') || [];
    var existingItem = cart.find(item => item.id == currentQuickProduct.id && item.length == lengthValue);

    if (existingItem) {
        existingItem.quantity += selectQtyCount; // increments by selected amount
    } else {
        cart.push({
            id: currentQuickProduct.id,
            name: currentQuickProduct.name,
            price: currentQuickProduct.price,
            image: currentQuickProduct.mainImage,
            color: "Standard", 
            length: isChainItem ? lengthValue : "N/A",
            quantity: selectQtyCount
        });
    }

    setCookie('shoppingCart', cart, 7); 
    updateCartBadge(); 

    alert(currentQuickProduct.name + " added to bag!");
    closeQuickShop();
}

//wishlist uses cookies
function addToWishlist(productId) {
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert("Please log in to save items to your wishlist!");
        window.location.href = 'login.html';
        return;
    }

    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        return;
    }

    var wishlist = getCookie('jewelry_wishlist') || [];
    var exists = wishlist.some(item => item.id == productId);

    if (!exists) {
        wishlist.push(product);
        setCookie('jewelry_wishlist', wishlist, 7);
        alert(`${product.name} added to your wishlist! ♡`);
    } else {
        alert("This item is already in your wishlist.");
    }
}

//carousel slides
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
    if (slides.length == 0) {
        return;
    }
    if (n > slides.length) { 
        slideIndex = 1;
    }    
    if (n < 1) { 
        slideIndex = slides.length; 
    }
    for (var i = 0; i < slides.length; i++) { 
        slides[i].style.display = "none"; 
    }
    for (var i = 0; i < dots.length; i++) { 
        dots[i].className = dots[i].className.replace(" active", ""); 
    }
    if (slides[slideIndex-1]) {
        slides[slideIndex-1].style.display = "block";  
    }
    if (dots[slideIndex-1]) {
        dots[slideIndex-1].className += " active";
    }
}

function startTimer() {
    var slides = document.getElementsByClassName("slide");
    if (slides.length == 0) {
        return;
    }
    timer = setInterval(function() {
        slideIndex++;
        showSlides(slideIndex);
    }, 5000);
}
//runtimeinit
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    showSlides(slideIndex);
    startTimer();
    updateCartBadge(); // load card array configurations on startup
    
    if (window.Auth && typeof Auth.updateHeaderUI == 'function') {
        Auth.updateHeaderUI();
    }
});