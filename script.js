const products = [
    { id: 1, name: "T-Shirt", category: "Clothing", price: 500, img: "https://files.cdn.printful.com/o/upload/file-upload/53/53f4388dc79736ff7be0f1c3a9cbb597?v=edc3b25890c252b9ede2bcf1bfae83c4" },
    { id: 2, name: "Jeans", category: "Clothing", price: 1200, img: "https://www.shutterstock.com/image-photo/jeans-pant-isolated-on-transparent-260nw-2590021165.jpg" },
    { id: 3, name: "Headphones", category: "Electronics", price: 2500, img: "https://i.https://img.drz.lazcdn.com/static/bd/p/21b018fd978b848daf6ce622b12d440a.jpg_720x720q80.jpg_.webpimgur.com/Vh7Cz1N.jpeg" },
    { id: 4, name: "Smart Watch", category: "Electronics", price: 3500, img: "https://i.imghttps://cdn.thewirecutter.com/wp-content/media/2025/10/BEST-SMARTWATCH-ANDROID-PHONES-04020.jpg?auto=webp&quality=75&width=1024ur.com/7zoFd2u.jpeg" },
    { id: 5, name: "Shoes", category: "Footwear", price: 1800, img: "https://i.imgur.cohttps://media.istockphoto.com/id/495204892/photo/sneakers.jpg?s=612x612&w=0&k=20&c=QSkl09_Rx2lvayG93dWBmoCsVPThoAB1VgcSyh6Jy_4=m/K4neH0T.jpeg" },
];

let cart = [];
let orders = []; // Array to store orders
let notifications = []; // Array to store notifications

const listContainer = document.getElementById("product-list");
const cartContainer = document.getElementById("cart");
const checkoutButton = document.getElementById("checkout");
const ordersContainer = document.getElementById("orders");
const notificationsContainer = document.getElementById("notifications");

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
        checkoutButton.style.display = "none";
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

    checkoutButton.style.display = "block";
}

// Feature 1: Real-time order status (Pending, Shipped, Delivered)
// We'll simulate status updates with timeouts for demonstration
function checkout() {
    if (cart.length === 0) return;

    const orderId = orders.length + 1;
    const order = {
        id: orderId,
        items: [...cart],
        status: 'Pending',
        createdAt: new Date().toLocaleString()
    };

    orders.push(order);
    cart = []; // Clear cart after checkout
    displayCart();
    displayOrders();
    notify(`Order #${orderId} placed and is now Pending.`);

    // Simulate status updates
    setTimeout(() => updateOrderStatus(orderId, 'Shipped'), 5000); // 5 seconds to Shipped
    setTimeout(() => updateOrderStatus(orderId, 'Delivered'), 10000); // Another 5 seconds to Delivered
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        displayOrders();
        notify(`Order #${orderId} updated to ${newStatus}.`);
    }
}

function displayOrders() {
    ordersContainer.innerHTML = "";

    if (orders.length === 0) {
        ordersContainer.innerHTML = "<p>No orders yet</p>";
        return;
    }

    orders.forEach((order) => {
        const div = document.createElement("div");
        div.className = "order-item";
        const itemsList = order.items.map(item => `${item.name} - ${item.price}৳`).join('<br>');
        div.innerHTML = `
            <span>Order #${order.id} - ${order.createdAt}</span>
            <p>Items:<br>${itemsList}</p>
            <p>Status: ${order.status}</p>
        `;
        ordersContainer.appendChild(div);
    });
}

// Feature 2: Notify customers about order updates via email or dashboard
// For email, we'll simulate with console.log (in real app, use EmailJS or backend)
// For dashboard, add to notifications section
function notify(message) {
    // Simulate email notification
    console.log(`Email sent: ${message}`); // In real app, integrate with email service

    // Dashboard notification
    notifications.push({ message, timestamp: new Date().toLocaleString() });
    displayNotifications();
}

function displayNotifications() {
    notificationsContainer.innerHTML = "";

    if (notifications.length === 0) {
        notificationsContainer.innerHTML = "<p>No notifications</p>";
        return;
    }

    notifications.forEach((notif) => {
        const div = document.createElement("div");
        div.className = "notification-item";
        div.innerHTML = `
            <span>${notif.timestamp}: ${notif.message}</span>
        `;
        notificationsContainer.appendChild(div);
    });
}

searchInput.addEventListener("input", displayProducts);
categorySelect.addEventListener("change", displayProducts);
priceRange.addEventListener("input", displayProducts);
checkoutButton.addEventListener("click", checkout);

displayProducts();
displayOrders();
displayNotifications();
