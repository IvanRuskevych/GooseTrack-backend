
const { CustomError, ctrlWrapper } = require('../utils')

const { Review } = require('../models/review')

// 1) Получение всех отзывов в базе
const getAllReviews = async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  if (page <= 0) {
    return res.status(400).json({ message: 'Invalid page number' });
  }

  const skip = (page - 1) * limit

  const reviews = await Review.find({}, '-createdAt -updatedAt')
    .skip(skip)
    .limit(parseInt(limit))

  res.json(reviews)
}

// 2) Получение своего отзыва пользователем
const getUserReview = async (req, res) => {
  // получили ид введённое пользователем из req.params
  const { id } = req.params

  // Нужно ли удалять не нужные поля в ответе?

  const result = await Review.findById(id, '-createdAt -updatedAt')

  if (!result) {
    throw CustomError(404, 'Not found')
  }

  res.json(result)
}

// 3) Добавление отзыва пользователем

const addReview = async (req, res) => {
  const { _id: owner } = req.user

  // Проверяем, есть ли отзыв от данного пользователя в базе
  const existingReview = await Review.findOne({ owner })

  if (existingReview) {
    return res.status(400).json({ message: 'You can only add one review.' })
  }

  // Если отзыва еще нет, добавляем его, распыляем обьект и добавляем owner
  const result = await Review.create({ ...req.body, owner })
  // если добавили статус 201 и отправляем результат на фронтенд
  res.status(201).json(result)
}

//  4) Редактирование своего отзыва пользователем

const updateReviewById = async (req, res) => {
  const { id } = req.params
  const { _id: owner } = req.user
  // Находим отзыв по идентификатору
  const review = await Review.findById(id, '-createdAt -updatedAt')

  if (!review) {
    throw CustomError(404, 'Review not found')
  }

  // Проверяем, принадлежит ли отзыв текущему пользователю
  if (review.owner.equals(owner)) {
    const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
      new: true
    })

    if (!updatedReview) {
      throw CustomError(404, 'Not found')
    }

    // Если да, то разрешаем редактирование
    res.json(updatedReview)
  } else {
    throw CustomError(403, "You don't have permission to update this review")
  }
}

// 5)  Удаление отзыва пользователем

const deleteReviewById = async (req, res) => {
  const { id } = req.params
  const { _id: owner } = req.user
  // проверяем есть ли у пользователя отзывы по этому ИД в базе
  const review = await Review.findById(id)

  if (!review) {
    throw CustomError(404, 'Review not found')
  }

  // Проверяем, принадлежит ли отзыв текущему пользователю
  if (review.owner.equals(owner)) {
    const result = await Review.findByIdAndRemove(id)
    //   если нет, то ошибка
    if (!result) {
      throw CustomError(404, 'Not found')
    }
    //   если да, то удаляем
    res.json({ message: 'Delete success' })
  } else {
    throw CustomError(403, "You don't have permission to delete this review")
  }
}

module.exports = {
  getAllReviews: ctrlWrapper(getAllReviews),
  getUserReview: ctrlWrapper(getUserReview),
  addReview: ctrlWrapper(addReview),
  deleteReviewById: ctrlWrapper(deleteReviewById),
  updateReviewById: ctrlWrapper(updateReviewById)
}
