const router = require("express").Router();
const c = require("../controllers/reviewController");

router.post("/", c.addReview);
module.exports = router;
