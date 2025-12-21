const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  res.json(await Product.find());
};
