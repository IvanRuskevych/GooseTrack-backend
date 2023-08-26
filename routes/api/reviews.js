// ПОЛУЧАЕМ ОТЗЫВЫ С БЕКЭНДА И ОТПРАВЛЯЕМ НА ФРОНТЕНД. ФРОНТЕНДУ НУЖНО ОТПРАВЛЯТЬ ОШИБКИ
const express = require('express')

const reviewController = require("../../controllers/controllersReviews")

// добавить authenticate как сделают
// const {validateBody, authenticate, isValidId} = require("../../middlewares/validateBody")
const { validateBody } = require("../../middlewares/");

const { schemas } = require("../../models/review")

const router = express.Router()

// router.get('/',  authenticate, bookController.getAll )

// 1) получить отзывы всех пользователей GET /reviews
router.get('/', reviewController.getAllReviews)

// 2) получить отзыв пользователя GET /reviews/own
router.get('/:id',
  //  isValidId,
  //  authenticate,
  reviewController.getUserReview)

// 3 ) Добавление отзыва.  POST /reviews/own

router.post(
  '/',
  //   authenticate,
  validateBody(schemas.addReviewSchema),
  reviewController.addReview
)

//  4) Редактирование своего отзыва пользователем PATCH /reviews/own

// router.patch(
//   '/:id',
//   isValidId,
// //   authenticate,
//   validateBody(schemas.addReviewSchema),
//   reviewController.updateReviewById
// )


//  5) Удаление отзыва пользователем

// router.delete('/:id',
// isValidId,
// //  authenticate,
//   reviewController.deleteReviewById)

module.exports = router
