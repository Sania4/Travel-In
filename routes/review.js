const express = require("express");
const router = express.Router( {mergeParams: true} );
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../Models/review.js");
const Listing = require("../Models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");
const review = require("../Models/review.js")

//REVIEW ROUTE - POST REQ
router.post("/", isLoggedIn, validateReview,
     wrapAsync(reviewController.createReview));

//REVIEW - DELETE ROUTE
router.delete('/:reviewId', isLoggedIn,
    isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;