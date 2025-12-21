const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: Array,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: Date
});

module.exports = mongoose.model("Order", orderSchema);
