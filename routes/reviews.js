const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync.js");

const { isReviewAuthor, validateReview } = require("../middlewares.js");

const reviewControllers = require("../controllers/reviews.js");

const { isLoggedIn } = require("../middlewares.js");

// ======================
// reviews Routes
// ======================

// Create Reviews
router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(reviewControllers.createReview)
);

// Delete Reviews
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviewControllers.deleteReview)
);

module.exports = router;
