const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  res.json(await Notification.find().sort({ createdAt: -1 }));
};

exports.createNotification = async message => {
  await Notification.create({ message });
};
