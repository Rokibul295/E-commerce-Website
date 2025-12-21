const router = require("express").Router();
const c = require("../controllers/orderController");

router.post("/", c.placeOrder);
router.get("/", c.getOrders);
router.put("/cancel/:id", c.cancelOrder);
router.put("/return/:id", c.returnOrder);

module.exports = router;
