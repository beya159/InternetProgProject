$(document).ready(function() {
    // 1. Fetch Products for the Home Page Grid
    $.getJSON('data/products.json', function(data) {
        let featuredHtml = '';
        
        // Show only first 4 for 'Best Sellers'
        data.slice(0, 4).forEach(product => {
            featuredHtml += `
                <div class="product-card" data-id="${product.id}">
                    <div class="img-placeholder">
                        <img src="${product.imagePath}" alt="${product.name}">
                        <div class="card-icons">
                            <button class="add-to-cart">🛒</button>
                            <button class="add-to-wishlist">♡</button>
                        </div>
                    </div>
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                </div>
            `;
        });
        
        $('#featured-grid').html(featuredHtml);
    });

    // 2. Sticky Header Logic
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('.main-header').addClass('sticky-active');
        } else {
            $('.main-header').removeClass('sticky-active');
        }
    });
});