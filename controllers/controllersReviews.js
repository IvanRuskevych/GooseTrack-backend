// // const Joi = require('joi');
// const { HttpError, controllerWrapper } = require('../helpers')
// // const books = require('../models/books');
// const { Review } = require('../models/review')

// // 1) Получение всех отзывов в базе
// const getAllReviews = async (req, res) => {
//   const result = await Review.find()

//   res.json(result)
// }

// // 2) Получение своего отзыва пользователем
// const getUserReview = async (req, res) => {
//   // получили ид введённое пользователем из req.params
//   const { id } = req.params

//   // Нужно ли удалять не нужные поля в ответе?

//   const result = await Review.findById(id)

//   // если книги с таким ил нет в базе
//   if (!result) {
//     // HttpError если поймал ошибку кидает в catch , тот или status и message получает и выдаёт, или с правой стороны по умолчанию то что записали 500 и "Server error"
//     throw HttpError(404, 'Not found')

//     // return res.status(404).json({message: "Not found"})
//   }
//   // отправляем результат на фронтенд
//   res.json(result)
// }

// // 3) Добавление отзыва пользователем

// const addReview = async (req, res) => {
//   // используем схему нашу addSchema, вызываем метод validate, который проверит req.body
//   const { _id: owner } = req.user
//   //   ЭТУ ОШИЬКУ ПЕРЕНЕСЛИ ВВАЛИДЕЙТ БОДИ
//   //   const { error } = addSchema.validate(req.body)

//   // Проверяем, есть ли отзыв от данного пользователя в базе
//   const existingReview = await Review.findOne({ owner })

//   if (existingReview) {
//     return res.status(400).json({ message: 'You can only add one review.' })
//   }

//   // Если отзыва еще нет, добавляем его
//   const result = await Review.create({ ...req.body, owner })
//   // если добавили статус 201 и отправляем результат на фронтенд
//   res.status(201).json(result)
// }

// //  4) Редактирование своего отзыва пользователем

// const updateReviewById = async (req, res) => {
//   const { id } = req.params
//   const { _id: owner } = req.user
//   // Находим отзыв по идентификатору
//   const review = await Review.findById(id)

//   if (!review) {
//     throw HttpError(404, 'Review not found')
//   }

//   // Проверяем, принадлежит ли отзыв текущему пользователю
//   if (review.owner.equals(owner)) {
//     const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
//       new: true
//     })

//     if (!updatedReview) {
//       throw HttpError(404, 'Not found')
//     }

//     // Если да, то разрешаем редактирование
//     res.json(updatedReview)
//   } else {
//     throw HttpError(403, "You don't have permission to update this review")
//   }
// }

// // 5)  Удаление отзыва пользователем

// const deleteReviewById = async (req, res) => {
//   const { id } = req.params
//   const { _id: owner } = req.user
//   // проверяем есть ли у пользователя отзывы по этому ИД в базе
//   const review = await Review.findById(id)

//   if (!review) {
//     throw HttpError(404, 'Review not found')
//   }

//   // Проверяем, принадлежит ли отзыв текущему пользователю
//   if (review.owner.equals(owner)) {
//     const result = await Review.findByIdAndRemove(id)
//     //   если нет, то ошибка
//     if (!result) {
//       throw HttpError(404, 'Not found')
//     }
//     //   если да, то удаляем
//     res.json({ message: 'Delete success' })
//   } else {
//     throw HttpError(403, "You don't have permission to delete this review")
//   }
// }

// module.exports = {
//   getAllReviews: controllerWrapper(getAllReviews),
//   getUserReview: controllerWrapper(getUserReview),
//   addReview: controllerWrapper(addReview),
//   deleteReviewById: controllerWrapper(deleteReviewById),
//   updateReviewById: controllerWrapper(updateReviewById)
// }
