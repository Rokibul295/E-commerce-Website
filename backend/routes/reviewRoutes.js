const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
router.get('/product/:productId', reviewController.getProductReviews);

// @route   GET /api/reviews/can-review/:productId
router.get('/can-review/:productId', auth, reviewController.canReviewProduct);

// @route   POST /api/reviews
router.post('/', auth, reviewController.addReview);

// @route   PUT /api/reviews/:id
router.put('/:id', auth, reviewController.updateReview);

// @route   DELETE /api/reviews/:id
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;

