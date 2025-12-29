import { addReview, getReviews } from "./api.js";

export class ReviewView {
  constructor(productId, containerId) {
    this.productId = productId;
    this.container = document.getElementById(containerId);
  }

  async loadReviews() {
    const reviews = await getReviews(this.productId);
    this.render(reviews);
  }

  render(reviews) {
    if (reviews.length === 0) {
      this.container.innerHTML = "<p>No reviews yet</p>";
      return;
    }

    this.container.innerHTML = reviews.map(r => `
      <div class="review-item">
        ⭐ ${r.rating} - ${r.comment} <small>(${new Date(r.createdAt).toLocaleString()})</small>
      </div>
    `).join("");
  }

  async submitReview(rating, comment) {
    await addReview(this.productId, rating, comment);
    this.loadReviews();
  }
}
