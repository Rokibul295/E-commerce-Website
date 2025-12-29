const router = require("express").Router();
const c = require("../controllers/notificationController");

router.get("/", c.getNotifications);

module.exports = router;
