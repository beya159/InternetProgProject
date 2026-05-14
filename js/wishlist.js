document.addEventListener('DOMContentLoaded', function() {
    displayWishlist();
});

function displayWishlist() {
    let grid = document.getElementById('wishlist-grid');
    let emptyMsg = document.getElementById('empty-msg');
    const wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];
    grid.innerHTML = "";

    if (wishlist.length === 0) {
        if (emptyMsg) emptyMsg.style.display = "block";
        return;
    }

    if (emptyMsg) emptyMsg.style.display = "none";

    wishlist.forEach(item => {
        const itemHtml = `
            <div class="wishlist-item">
                <img src="${item.mainImage}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">$${item.price.toFixed(2)}</p>
                <div class="wishlist-btn-group">
                    <button class="add-to-bag-btn" onclick="window.location.href='product-detail.html?id=${item.id}'">VIEW ITEM</button>
                    <button class="remove-wish-btn" onclick="removeFromWishlist(${item.id})">Remove</button>
                </div>
            </div>
        `;
        grid.innerHTML += itemHtml;
    });
}

function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];

    wishlist = wishlist.filter(item => item.id != id);
    
    // save back tout de suite
    localStorage.setItem('userWishlist', JSON.stringify(wishlist));
    
    // rerun it without having to refresh page
    displayWishlist(); 
}

function quickBag(id) {
    window.location.href = `product-detail.html?id=${id}`;
}