import { getOrders, cancelOrder, returnOrder } from "./api.js";

export class OrderView {
  constructor() {
    this.ordersContainer = document.getElementById("orders");
  }

  async loadOrders() {
    const orders = await getOrders();
    this.render(orders);
  }

  render(orders) {
    if (orders.length === 0) {
      this.ordersContainer.innerHTML = "<p>No orders yet</p>";
      return;
    }

    this.ordersContainer.innerHTML = orders.map(o => `
      <div class="order-item">
        Order #${o._id} - ${o.status}<br>
        <button onclick="cancelOrder('${o._id}').then(() => orderView.loadOrders())">Cancel</button>
        <button onclick="returnOrder('${o._id}').then(() => orderView.loadOrders())">Return</button>
      </div>
    `).join("");
  }
}
