export class CartView {
  constructor() {
    this.cartContainer = document.getElementById("cart");
    this.cart = [];
  }

  setCart(cart) {
    this.cart = cart;
    this.render();
  }

  render() {
    if (this.cart.length === 0) {
      this.cartContainer.innerHTML = "<p>Cart is empty</p>";
      return;
    }

    this.cartContainer.innerHTML = this.cart.map((item, idx) => `
      <div class="cart-item">
        ${item.name} - ${item.price}৳
        <button onclick="removeFromCart(${idx})">Remove</button>
      </div>
    `).join("");
  }
}
