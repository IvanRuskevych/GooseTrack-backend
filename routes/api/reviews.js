// GET REVIEWS FROM BACKEND AND SEND TO FRONTEND.
const express = require('express')

const reviewController = require('../../controllers/controllersReviews')

const { schemas } = require('../../models/review')
const { validateBody, authenticate, isValidId } = require('../../middlewares')

const router = express.Router()

// 1) Get reviews of all users. GET /reviews
router.get('/', reviewController.getAllReviews)

// 2) Get a user's review. GET /reviews/own

router.get('/own', authenticate, reviewController.getUserReview)

// 3) Add a review. POST /reviews/own
router.post(
  '/',
  authenticate,
  validateBody(schemas.addReviewSchema),
  reviewController.addReview
)

// 4) Update a user's review. PATCH /reviews/own
router.patch(
  '/:id',
  isValidId,
  authenticate,
  validateBody(schemas.addReviewSchema),
  reviewController.updateReviewById
)

// 5) Delete a user's review.
router.delete(
  '/:id',
  isValidId,
  authenticate,
  reviewController.deleteReviewById
)

module.exports = router
