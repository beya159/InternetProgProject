// 1. Grab the ID from the URL
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

let selectedColor = "";

function loadProduct() {
    fetch('data/products.json')
        .then(res => res.json())
        .then(products => {
            // Find the specific item using the ID from the URL
            const item = products.find(p => p.id == productId);

            if (item) {
                renderProduct(item);
            } else {
                document.body.innerHTML = "<h1>Product not found</h1>";
            }
        });
}

function renderProduct(item) {
    document.getElementById('p-name').innerText = item.name;
    document.getElementById('p-price').innerText = `$${item.price.toFixed(2)}`;
    document.getElementById('p-desc').innerText = item.description;
    document.getElementById('primary-image').src = item.mainImage;

    // Build Thumbnail Column
    const thumbDiv = document.getElementById('thumb-column');
    // Combine main image + angles into one array
    const allImages = [item.mainImage, ...item.angles];

    allImages.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = "thumb-item";
        // When you click a thumb, update the big image
        img.onclick = () => {
            document.getElementById('primary-image').src = imgSrc;
        };
        thumbDiv.appendChild(img);
    });
}

function handleAddToCart() {
    const length = document.getElementById('size-dropdown').value;
    if (!selectedColor || !length) {
        document.getElementById('error-msg').style.display = "block";
    } else {
        alert("Added to cart successfully!");
        document.getElementById('error-msg').style.display = "none";
    }
}

function selectColor(color) {
    selectedColor = color;
    console.log("Selected color:", color);
}

// Kick off the loading process
loadProduct();