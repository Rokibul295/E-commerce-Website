const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const auth = require('../middleware/auth');

// @route   GET /api/recommendations
router.get('/', auth, recommendationController.getRecommendations);

// @route   POST /api/recommendations/view
router.post('/view', auth, recommendationController.trackProductView);

// @route   POST /api/recommendations/dismiss
router.post('/dismiss', auth, recommendationController.dismissRecommendation);

module.exports = router;
