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
    
    // Filter out ONLY the item with the matching ID
    const updatedWishlist = wishlist.filter(item => item.id != id);
    
    // Save back to local storage
    localStorage.setItem('userWishlist', JSON.stringify(updatedWishlist));
    
    // Immediately redraw the UI
    displayWishlist(); 
}

function quickBag(id) {
    window.location.href = `product-detail.html?id=${id}`;
}