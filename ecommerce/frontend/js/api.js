const BASE_URL = "http://localhost:5000/api";

/* ---------------- PRODUCTS ---------------- */

export async function getProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
}

/* ---------------- ORDERS ---------------- */

export async function placeOrder(items) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  });
  return res.json();
}

export async function getOrders() {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
}

export async function cancelOrder(orderId) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
    method: "PUT"
  });
  return res.json();
}

export async function returnOrder(orderId) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/return`, {
    method: "PUT"
  });
  return res.json();
}

/* ---------------- REVIEWS ---------------- */

export async function addReview(productId, rating, comment) {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, rating, comment })
  });
  return res.json();
}

export async function getReviews(productId) {
  const res = await fetch(`${BASE_URL}/reviews/${productId}`);
  return res.json();
}

/* ---------------- NOTIFICATIONS ---------------- */

export async function getNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`);
  return res.json();
}
