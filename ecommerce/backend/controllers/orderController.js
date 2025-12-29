const Notification = require("../models/Notification");

exports.placeOrder = async (req, res) => {
  const order = await Order.create({ items: req.body.items });

  await Notification.create({
    message: "Order placed successfully",
    type: "order"
  });

  res.json(order);
};


const Order = require("../models/Order");

exports.placeOrder = async (req, res) => {
  const order = await Order.create({ items: req.body.items });
  res.json(order);

  setTimeout(async () => {
    order.status = "Delivered";
    order.deliveredAt = new Date();
    await order.save();
  }, 10000);
};

exports.getOrders = async (req, res) => {
  res.json(await Order.find());
};

exports.cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  const minutes = (Date.now() - order.createdAt) / 60000;

  if (minutes > 10)
    return res.status(400).json({ message: "Cancel time expired" });

  order.status = "Cancelled";
  await order.save();
  res.json(order);
};

exports.returnOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  const days = (Date.now() - order.deliveredAt) / (1000 * 60 * 60 * 24);

  if (order.status !== "Delivered" || days > 7)
    return res.status(400).json({ message: "Return not allowed" });

  order.status = "Returned";
  await order.save();
  res.json(order);
};
