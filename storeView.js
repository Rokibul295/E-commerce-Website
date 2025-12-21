export class StoreView {
    constructor() {
        this.productList = document.getElementById("product-list");
        this.cartContainer = document.getElementById("cart");
        this.ordersContainer = document.getElementById("orders");
        this.notificationsContainer = document.getElementById("notifications");
        this.checkoutBtn = document.getElementById("checkout");
        this.priceDisplay = document.getElementById("priceDisplay");
    }

    renderProducts(products, onAdd) {
        this.productList.innerHTML = "";

        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${p.img}">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>${p.category}</p>
                    <p>${p.price}৳</p>
                    <button>Add to Cart</button>
                </div>
            `;
            card.querySelector("button").onclick = () => onAdd(p.id);
            this.productList.appendChild(card);
        });
    }

    renderCart(cart, onRemove) {
        this.cartContainer.innerHTML = "";

        if (cart.length === 0) {
            this.cartContainer.innerHTML = "<p>Your cart is empty</p>";
            this.checkoutBtn.style.display = "none";
            return;
        }

        cart.forEach((item, i) => {
            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <span>${item.name} - ${item.price}৳</span>
                <button>Remove</button>
            `;
            div.querySelector("button").onclick = () => onRemove(i);
            this.cartContainer.appendChild(div);
        });

        this.checkoutBtn.style.display = "block";
    }

    renderOrders(orders) {
        this.ordersContainer.innerHTML = orders.length
            ? orders.map(o => `
                <div class="order-item">
                    <p>Order #${o.id} - ${o.createdAt}</p>
                    <p>Status: ${o.status}</p>
                </div>
            `).join("")
            : "<p>No orders yet</p>";
    }

    renderNotifications(notifications) {
        this.notificationsContainer.innerHTML = notifications.length
            ? notifications.map(n =>
                `<div class="notification-item">${n.timestamp}: ${n.message}</div>`
              ).join("")
            : "<p>No notifications</p>";
    }
}
