var productNames = [];

//get names JSON file
function loadProductNames() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "products.json", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var products = JSON.parse(xhr.responseText);
            // Put all product names into our array
            for (var i = 0; i < products.length; i++) {
                productNames.push(products[i].name);
            }
        }
    };
    xhr.send();
}

function auto_complete_products(obj) {
    var autocompleteDiv = document.querySelector("#autocomplete");
    var autocompleteList = document.querySelector("#autocomplete > ul");
    var val = obj.value;
    // show the div
    autocompleteDiv.setAttribute("class", "autocomplete");
    // clear the old list
    autocompleteList.innerHTML = "";
    // if search is empty, hide the list and stop
    if (val.length == 0) {
        autocompleteDiv.setAttribute("class", "hidden");
        return;
    }
    // loop through product names
    for (var i = 0; i < productNames.length; i++) {
        // Match the start of the word (teacher's slice logic)
        if (productNames[i].slice(0, val.length).toLowerCase() == val.toLowerCase()) {
            autocompleteList.innerHTML += "<li onclick='fillSearchText(this);'>" + productNames[i] + "</li>";
        }
    }
}
// when a user clicks a suggestion
function fillSearchText(li) {
    document.querySelector("#global-search").value = li.innerHTML;
    document.querySelector("#autocomplete").setAttribute("class", "hidden");
}
document.addEventListener('DOMContentLoaded', loadProductNames);