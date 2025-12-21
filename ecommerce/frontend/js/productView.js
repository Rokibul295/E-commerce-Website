import { getProducts } from "./api.js";

export class ProductView {
  constructor(addToCartCallback) {
    this.addToCartCallback = addToCartCallback;
    this.productsContainer = document.getElementById("products");
  }

  async loadProducts() {
    const products = await getProducts();
    this.render(products);
  }

  render(products) {
    this.productsContainer.innerHTML = products.map(p => `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}" />
        <h3>${p.name} ⭐ ${p.rating.toFixed(1)}</h3>
        <p>Price: ${p.price}৳</p>
        <button onclick="addToCart('${p._id}', '${p.name}', ${p.price})">Add to Cart</button>
      </div>
    `).join("");
  }
}
