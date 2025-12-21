const Review = require("../models/Review");
const Product = require("../models/Product");

exports.addReview = async (req, res) => {
  const review = await Review.create(req.body);

  const reviews = await Review.find({ productId: req.body.productId });
  const avg =
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(req.body.productId, { rating: avg });
  res.json(review);
};
