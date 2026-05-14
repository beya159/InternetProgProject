document.addEventListener('DOMContentLoaded', function() {
    displayWishlist();
});

function displayWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const emptyMsg = document.getElementById('empty-msg');
    const wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];

    grid.innerHTML = "";

    if (wishlist.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }

    emptyMsg.style.display = "none";

    wishlist.forEach(item => {
        const itemHtml = `
            <div class="wishlist-item">
                <img src="${item.mainImage}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">$${item.price.toFixed(2)}</p>
                <div class="wishlist-btn-group">
                    <button class="add-to-bag-btn" onclick="quickBag(${item.id})">VIEW ITEM</button>
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
    localStorage.setItem('userWishlist', JSON.stringify(wishlist));
    displayWishlist(); // Refresh the grid
}

function quickBag(id) {
    // This just sends them back to the shop page with the ID to look at it
    window.location.href = `index.html?id=${id}`;
}