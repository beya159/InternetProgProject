document.addEventListener('DOMContentLoaded', function() {
    displayWishlist();
    
    // check if name is there: if so, u logged in. if not, debug
    if (window.Auth && typeof Auth.updateHeaderUI == 'function') {
        Auth.updateHeaderUI();
    }
});

function displayWishlist() {
    let grid = document.getElementById('wishlist-grid');
    let emptyMsg = document.getElementById('empty-msg');
    
    let wishlist = [];
    var match = document.cookie.match(/(^| )jewelry_wishlist=([^;]+)/);
    if (match) {
        try {
            wishlist = JSON.parse(decodeURIComponent(match[2]));
        } catch (e) {
            wishlist = [];
        }
    }
    
    // clear the grid to prevent duplication
    if (grid) grid.innerHTML = "";

    if (wishlist.length == 0) {
        if (emptyMsg) emptyMsg.style.display = "block";
        return;
    }

    if (emptyMsg) emptyMsg.style.display = "none";

    wishlist.forEach(item => {
        // Safe check to verify which property format the item image is arriving under
        var itemImgSrc = item.mainImage || item.image || "";

        const itemHtml = `
            <div class="wishlist-item">
                <img src="../${itemImgSrc}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">$${item.price.toFixed(2)}</p>
                <div class="wishlist-btn-group">
                    <button class="add-to-bag-btn" onclick="quickBag(${item.id})">VIEW ITEM</button>
                    <button class="remove-wish-btn" onclick="removeFromWishlist(${item.id})">Remove</button>
                </div>
            </div>
        `;
        if (grid) grid.innerHTML += itemHtml;
    });
}

function removeFromWishlist(id) {
    // pull out current matching collection stack from cookies
    let wishlist = [];
    var match = document.cookie.match(/(^| )jewelry_wishlist=([^;]+)/);
    if (match) {
        try {
            wishlist = JSON.parse(decodeURIComponent(match[2]));
        } catch (e) {
            wishlist = [];
        }
    }

    const updatedWishlist = wishlist.filter(item => item.id != id);
    
    document.cookie = "jewelry_wishlist=" + cookieValue + "; path=/; max-age=" + (30 * 24 * 60 * 60);
    
    // redraw the UI without page refresh
    displayWishlist(); 
}

function quickBag(id) {
    window.location.href = `product-detail.html?id=${id}`;
}