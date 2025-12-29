import { ProductView } from "./js/productView.js";
import { CartView } from "./js/cartView.js";
import { OrderView } from "./js/orderView.js";
import { ReviewView } from "./js/reviewView.js";
import { NotificationView } from "./js/notificationView.js";

// Initialize
window.cart = [];
window.addToCart = (id, name, price) => {
  window.cart.push({ id, name, price });
  cartView.setCart(window.cart);
};

window.removeFromCart = idx => {
  window.cart.splice(idx, 1);
  cartView.setCart(window.cart);
};

// Views
const productView = new ProductView(window.addToCart);
const cartView = new CartView();
const orderView = new OrderView();
const notificationView = new NotificationView("notifications");

// Load all
productView.loadProducts();
orderView.loadOrders();
notificationView.loadNotifications();

// Checkout button
document.getElementById("checkout").onclick = async () => {
  await fetch("http://localhost:5000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: window.cart })
  });
  window.cart = [];
  cartView.setCart([]);
  orderView.loadOrders();
  notificationView.loadNotifications();
};
