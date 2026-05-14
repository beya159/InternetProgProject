document.addEventListener('DOMContentLoaded', function() {
    displayWishlist();
});

function displayWishlist() {
    let grid = document.getElementById('wishlist-grid');
    let emptyMsg = document.getElementById('empty-msg');
    
    // Always fetch the freshest data from localStorage
    const wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];
    
    // Clear the grid to prevent duplication
    if (grid) grid.innerHTML = "";

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
                    <button class="add-to-bag-btn" onclick="quickBag(${item.id})">VIEW ITEM</button>
                    <button class="remove-wish-btn" onclick="removeFromWishlist(${item.id})">Remove</button>
                </div>
            </div>
        `;
        if (grid) grid.innerHTML += itemHtml;
    });
}

function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];

    // Use != instead of !== to handle string vs number comparison
    const updatedWishlist = wishlist.filter(item => item.id != id);
    
    // Save the updated list back to localStorage
    localStorage.setItem('userWishlist', JSON.stringify(updatedWishlist));
    
    // Redraw the UI immediately without a page refresh
    displayWishlist(); 
}

function quickBag(id) {
    window.location.href = `product-detail.html?id=${id}`;
}