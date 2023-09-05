const { ctrlWrapper } = require('../utils');

const { Review } = require('../models/review');

// 1) Получение всех отзывов в базе без авторизации
const getAllReviews = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  if (page <= 0) {
    return res.status(400).json({ message: 'Invalid page number' });
  }

  const skip = (page - 1) * limit;

  const reviews = await Review.find({}, '-createdAt -updatedAt', {
    skip,
    limit,
  }).populate('owner', 'name avatarURL');

  res.json(reviews);
};

// 2) Получение отзыва пользователя ID owner

const getUserReview = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const requestedUserId = req.user._id;
  // console.log('requestedUserId=========>>>>>', requestedUserId);

  if (page <= 0) {
    return res.status(400).json({ message: 'Invalid page number' });
  }

  const skip = (page - 1) * limit;

  // Проверяем, соответствует ли идентификатор в токене идентификатору в запросе
  if (!owner.equals(requestedUserId)) {
    return res.status(403).json({ message: "You don't have permission to access this resource" });
  }

  const reviews = await Review.find({ owner: owner }, '-createdAt -updatedAt')
    .skip(skip)
    .limit(limit);

  if (!reviews.length) {
    // return res.status(404).json({ message: 'No reviews found for this owner' });
    return res.json(reviews); // у разі відсутності відгуку має повертати пустий масив та status(200)
  }

  res.json(reviews);
};

// 3) Добавление отзыва пользователем

const addReview = async (req, res) => {
  const { _id: owner } = req.user;

  // Проверяем, есть ли отзыв от данного пользователя в базе
  const existingReview = await Review.findOne({ owner });

  if (existingReview) {
    return res.status(400).json({ message: 'You can only add one review.' });
  }

  // Если отзыва еще нет, добавляем его, распыляем обьект и добавляем owner
  const result = await Review.create({ ...req.body, owner });
  // если добавили статус 201 и отправляем результат на фронтенд
  res.status(201).json(result);
};

//  4) Редактирование отзыва пользователем по ID отзыва Ready!

const updateReviewById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  // Находим отзыв по идентификатору
  const review = await Review.findById(id, '-createdAt -updatedAt');

  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  // Проверяем, принадлежит ли отзыв текущему пользователю
  if (review.owner.equals(owner)) {
    // Добавляем проверку на соответствие идентификаторов
    if (review._id.equals(id)) {
      const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!updatedReview) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      // Если да, то разрешаем редактирование
      res.json(updatedReview);
    } else {
      res.status(400).json({ error: 'Provided ID does not match the ID in the database' });
    }
  } else {
    res.status(403).json({ error: "You don't have permission to update this review" });
  }
};

// 5)  Удаление отзыва пользователем по ID отзыва

// const deleteReviewById = async (req, res) => {
//   const { id } = req.params;
//   const { _id: owner } = req.user;

//   // Проверяем, есть ли у пользователя отзывы по этому ИД в базе
//   const review = await Review.findById(id);

//   if (!review) {
//     res.status(404).json({ error: 'Review not found' });
//     return;
//   }

//   // Проверяем, принадлежит ли отзыв текущему пользователю
//   if (review.owner.equals(owner)) {
//     // Добавляем проверку на соответствие идентификаторов
//     if (review._id.equals(id)) {
//       const result = await Review.findByIdAndRemove(id);
//       // Если нет, то ошибка
//       if (!result) {
//         res.status(404).json({ error: 'Not found' });
//         return;
//       }
//       // Если да, то удаляем
//       res.json({ message: 'Delete success' });
//     } else {
//       res.status(400).json({ error: 'Provided ID does not match the ID in the database' });
//     }
//   } else {
//     res.status(403).json({ error: "You don't have permission to delete this review" });
//   }
// };
const deleteReviewById = async (req, res) => {
  const { id } = req.params;

  // Проверяем, существует ли отзыв с указанным ID в базе данных
  const review = await Review.findById(id);

  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  // Удаляем отзыв, так как аутентификация не требуется
  const result = await Review.findByIdAndRemove(id);

  // Проверяем успешность удаления
  if (!result) {
    res.status(500).json({ error: 'Failed to delete review' });
    return;
  }

  res.json({ message: 'Delete success' });
};

module.exports = {
  getAllReviews: ctrlWrapper(getAllReviews),
  getUserReview: ctrlWrapper(getUserReview),
  addReview: ctrlWrapper(addReview),
  deleteReviewById: ctrlWrapper(deleteReviewById),
  updateReviewById: ctrlWrapper(updateReviewById),
};

// const { CustomError, ctrlWrapper } = require('../utils')

// const { Review } = require('../models/review')

// // 1) Получение всех отзывов в базе без авторизации
// const getAllReviews = async (req, res) => {
//   const { page = 1, limit = 10 } = req.query
//   if (page <= 0) {
//     return res.status(400).json({ message: 'Invalid page number' })
//   }

//   const skip = (page - 1) * limit

//   const reviews = await Review.find({}, '-createdAt -updatedAt', {
//     skip,
//     limit
//   }).populate('owner', 'name avatarURL')

//   res.json(reviews)
// }

// // 2) Получение отзыва пользователем по ИД отзыва и по ID owner

// const getUserReview = async (req, res) => {
//   const { _id: owner } = req.user
//   const { page = 1, limit = 10 } = req.query

//   if (page <= 0) {
//     return res.status(400).json({ message: 'Invalid page number' })
//   }

//   const skip = (page - 1) * limit

//   const reviews = await Review.find({ owner: owner }, '-createdAt -updatedAt')
//     .skip(skip)
//     .limit(limit)

//   if (!reviews.length) {
//     return res.status(404).json({ message: 'No reviews found for this owner' })
//   }

//   res.json(reviews)
// }

// // 3) Добавление отзыва пользователем

// const addReview = async (req, res) => {
//   const { _id: owner } = req.user

//   // Проверяем, есть ли отзыв от данного пользователя в базе
//   const existingReview = await Review.findOne(
//     { owner },
//     '-createdAt -updatedAt'
//   )

//   if (existingReview) {
//     return res.status(400).json({ message: 'You can only add one review.' })
//   }

//   // Если отзыва еще нет, добавляем его, распыляем обьект и добавляем owner
//   const result = await Review.create({ ...req.body, owner })
//   // если добавили статус 201 и отправляем результат на фронтенд
//   res.status(201).json(result)
// }

// //  4) Редактирование отзыва пользователем по ID отзыва

// const updateReviewById = async (req, res) => {
//   const { id } = req.params
//   const { _id: owner } = req.user
//   // Находим отзыв по идентификатору
//   const review = await Review.findById(id, '-createdAt -updatedAt')

//   if (!review) {
//     throw CustomError(404, 'Review not found')
//   }

//   // Проверяем, принадлежит ли отзыв текущему пользователю
//   if (review.owner.equals(owner)) {
//     const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
//       new: true
//     })

//     if (!updatedReview) {
//       throw CustomError(404, 'Not found')
//     }

//     // Если да, то разрешаем редактирование
//     res.json(updatedReview)
//   } else {
//     throw CustomError(403, "You don't have permission to update this review")
//   }
// }

// // 5)  Удаление отзыва пользователем по ID отзыва

// const deleteReviewById = async (req, res) => {
//   const { id } = req.params
//   const { _id: owner } = req.user
//   // проверяем есть ли у пользователя отзывы по этому ИД в базе
//   const review = await Review.findById(id)

//   if (!review) {
//     throw CustomError(404, 'Review not found')
//   }

//   // Проверяем, принадлежит ли отзыв текущему пользователю res.status(200).json({ message: 'Delete success' }) ?
//   if (review.owner.equals(owner)) {
//     const result = await Review.findByIdAndRemove(id)
//     //   если нет, то ошибка
//     if (!result) {
//       throw CustomError(404, 'Not found')
//     }
//     //   если да, то удаляем
//     res.json({ message: 'Delete success' })
//   } else {
//     throw CustomError(403, "You don't have permission to delete this review")
//   }
// }

// module.exports = {
//   getAllReviews: ctrlWrapper(getAllReviews),
//   getUserReview: ctrlWrapper(getUserReview),
//   addReview: ctrlWrapper(addReview),
//   deleteReviewById: ctrlWrapper(deleteReviewById),
//   updateReviewById: ctrlWrapper(updateReviewById)
// }
