const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

let currentProduct = null;
let selectedColor = "";
let currentQty = 1;

function loadProduct() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/products.json', true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var products = JSON.parse(xhr.responseText);
            // find specific item using the ID from the URL
            currentProduct = products.find(function(p) {
                return p.id == productId;
            });

            if (currentProduct) {
                renderProduct(currentProduct);
            } else {
                document.querySelector('.detail-container').innerHTML = "<h1>Product not found</h1>";
            }
        }
    };
    xhr.send();
}

function renderProduct(item) {
    document.getElementById('p-name').innerText = item.name;
    document.getElementById('p-price').innerText = `$${item.price.toFixed(2)}`;
    document.getElementById('p-desc').innerText = item.description;
    document.getElementById('primary-image').src = item.mainImage;

    const thumbDiv = document.getElementById('thumb-column');
    thumbDiv.innerHTML = ""; // just in case lol
    
    const allImages = [item.mainImage, ...item.angles];

    allImages.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = "thumb-item";
        img.onclick = function() {
            document.getElementById('primary-image').src = imgSrc;
        };
        thumbDiv.appendChild(img);
    });
}

function changeQty(amount) {
    currentQty += amount;
    
    // 1 min.
    if (currentQty < 1) {
        currentQty = 1;
    }
    
    document.getElementById('qty-count').innerText = currentQty;
}

function selectColor(color) {
    selectedColor = color;
    console.log("Selected color:", color);
    // hide error once choice made
    document.getElementById('error-msg').style.display = "none";
}

function handleAddToCart() {
    const length = document.getElementById('size-dropdown').value;
    const errorMsg = document.getElementById('error-msg');

    // check login
    //check later another way than "localStorage"
    const user = localStorage.getItem('currentUser');
    if (!user) {
        alert("You must be logged in to add items to your cart.");
        window.location.href = 'login.html'; 
        return;
    }
//forces user to pick a colour b4 adding item
    if (!selectedColor || !length) {
        errorMsg.style.display = "block";
        errorMsg.innerText = "* PLEASE SELECT COLOR AND LENGTH BEFORE ADDING.";
        return;
    }
//temporary until having an actual cart page to save on
    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.mainImage,
        color: selectedColor,
        length: length,
        quantity: currentQty
    };

    // Get existing cart or empty array
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    // just add to quantity if an item w the exam safe info exists
    const existingIndex = cart.findIndex(item => 
        item.id === cartItem.id && 
        item.color === cartItem.color && 
        item.length === cartItem.length
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += currentQty;
    } else {
        cart.push(cartItem);
    }

    // save back to storage
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    alert(`Success! ${currentQty} ${currentProduct.name}(s) added to cart.`);
    errorMsg.style.display = "none";
}

loadProduct();