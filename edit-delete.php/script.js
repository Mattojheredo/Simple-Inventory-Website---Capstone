// Sample grocery products

let products = [
    { id: 1, name: "Rice", category: "Pantry", price: 45, quantity: 25, restockLevel: 10 },
    { id: 2, name: "Milk", category: "Dairy", price: 52, quantity: 3, restockLevel: 6 },
    { id: 3, name: "Bread", category: "Bakery", price: 30, quantity: 14, restockLevel: 5 },
    { id: 4, name: "Coffee", category: "Beverages", price: 120, quantity: 18, restockLevel: 6 },
    { id: 5, name: "Dishwashing Liquid", category: "Household", price: 65, quantity: 9, restockLevel: 4 }
];

// Save products in localStorage
if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(products));
} else {
    products = JSON.parse(localStorage.getItem("products"));
}

// Get the item ID from the URL
let urlParams = new URLSearchParams(window.location.search);
let itemId = Number(urlParams.get("id"));

// Display products in the inventory table
function displayProducts() {

    let inventoryList = document.getElementById("inventoryList");

    inventoryList.innerHTML = "";

    products.forEach(function(product) {

        inventoryList.innerHTML += `
            <tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₱${product.price}</td>
                <td>${product.quantity}</td>
                <td>${product.restockLevel}</td>
                <td>
                    <a class="btn btn-edit" href="edit-item.html?id=${product.id}">Edit</a>
                    <button onclick="deleteItem(${product.id})">Delete</button>
                </td>
            </tr>
        `;

    });

}


// Display products only if the inventory table exists
if (document.getElementById("inventoryList")) {
    displayProducts();
}


function editItem(id) {

    // Find the selected product
    let product = products.find(function(item) {
        return item.id === id;
    });

    // Put the product information into the form
    if (product) {
        document.getElementById("itemId").value = product.id;
        document.getElementById("itemName").value = product.name;
        document.getElementById("category").value = product.category;
        document.getElementById("price").value = product.price;
        document.getElementById("quantity").value = product.quantity;
        document.getElementById("restockLevel").value = product.restockLevel;
    }

}

// Load the selected product when the Edit page opens
if (document.getElementById("editForm")) {
    editItem(itemId);
}

if (document.getElementById("editForm")) {
    document.getElementById("editForm").addEventListener("submit", function(event) {

    // Prevent the page from refreshing
    event.preventDefault();

    // Get the ID of the product being edited
    let id = Number(document.getElementById("itemId").value);

    let price = Number(document.getElementById("price").value);
    let quantity = Number(document.getElementById("quantity").value);
    let restockLevel = Number(document.getElementById("restockLevel").value);

    // Check if values are valid
    if (price < 0 || quantity < 0 || restockLevel < 0) {
    alert("Please enter values that are zero or greater.");
    return;
}
    // Find the product that needs to be updated
    let product = products.find(function(item) {
        return item.id === id;
    });

    // Update the product information
    if (product) {
            product.name = document.getElementById("itemName").value;
            product.category = document.getElementById("category").value;
            product.price = price;
            product.quantity = quantity;
            product.restockLevel = restockLevel;
    }

    localStorage.setItem("products", JSON.stringify(products));

    alert("Item updated successfully!");

    window.location.href = "index.html";

});
}

function deleteItem(id) {

    // Ask for confirmation
    let confirmDelete = confirm("Are you sure you want to delete this item?");

    // Delete only if the user confirms
    if (confirmDelete) {

        products = products.filter(function(item) {
            return item.id !== id;
        });

        // Save updated products
        localStorage.setItem("products", JSON.stringify(products));

        // Refresh the inventory table
        displayProducts();

        alert("Item deleted successfully!");
    }
}