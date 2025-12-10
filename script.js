const products = [
    { id: 1, name: "T-Shirt", category: "Clothing", price: 500, img: "https://files.cdn.printful.com/o/upload/file-upload/53/53f4388dc79736ff7be0f1c3a9cbb597?v=edc3b25890c252b9ede2bcf1bfae83c4" },
    { id: 2, name: "Jeans", category: "Clothing", price: 1200, img: "https://www.shutterstock.com/image-photo/jeans-pant-isolated-on-transparent-260nw-2590021165.jpg" },
    { id: 3, name: "Headphones", category: "Electronics", price: 2500, img: "https://i.https://img.drz.lazcdn.com/static/bd/p/21b018fd978b848daf6ce622b12d440a.jpg_720x720q80.jpg_.webpimgur.com/Vh7Cz1N.jpeg" },
    { id: 4, name: "Smart Watch", category: "Electronics", price: 3500, img: "https://i.imghttps://cdn.thewirecutter.com/wp-content/media/2025/10/BEST-SMARTWATCH-ANDROID-PHONES-04020.jpg?auto=webp&quality=75&width=1024ur.com/7zoFd2u.jpeg" },
    { id: 5, name: "Shoes", category: "Footwear", price: 1800, img: "https://i.imgur.cohttps://media.istockphoto.com/id/495204892/photo/sneakers.jpg?s=612x612&w=0&k=20&c=QSkl09_Rx2lvayG93dWBmoCsVPThoAB1VgcSyh6Jy_4=m/K4neH0T.jpeg" },
];

let cart = [];

const listContainer = document.getElementById("product-list");
const cartContainer = document.getElementById("cart");

const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const priceRange = document.getElementById("priceRange");
const priceDisplay = document.getElementById("priceDisplay");

function displayProducts() {
    listContainer.innerHTML = "";

    const search = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    const maxPrice = priceRange.value;

    priceDisplay.textContent = `Max Price: ${maxPrice}৳`;

    const filtered = products.filter((p) => {
        return (
            p.name.toLowerCase().includes(search) &&
            (category === "All" || p.category === category) &&
            p.price <= maxPrice
        );
    });

    filtered.forEach((p) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${p.img}" alt="${p.name}">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p>Category: ${p.category}</p>
                <p>Price: ${p.price}৳</p>
                <button onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function addToCart(id) {
    const product = products.find((p) => p.id === id);
    cart.push(product);
    displayCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

function displayCart() {
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty</p>";
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <span>${item.name} - ${item.price}৳</span>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartContainer.appendChild(div);
    });
}

searchInput.addEventListener("input", displayProducts);
categorySelect.addEventListener("change", displayProducts);
priceRange.addEventListener("input", displayProducts);

displayProducts();
