// // СОЗДАЕМ СХЕМЫ ДЛЯ ПРОВЕРКИ ПРИ ПЕРЕДАЧИ ОБЬЕКТОВ (mongoDB-Mongoose)

// addSchema JOI схема на проверку того что приходит с фронтенда
// bookSchema проверка того что сохраняется в базе. Проверка перед сохранением

const { Schema, model } = require('mongoose')
const { handleMongooseError } = require('../utils')

const Joi = require('joi')

const reviewSchema = new Schema(
  {
    text: { type: String, required: true, maxlength: 250 }, // кол-во символов в отзыве 250
    rating: { type: Number, required: true, min: 1, max: 5 }, // от 1 до 5 звезд оценку ставим

    owner: {
      // строка для записи ид пользователя особая
      type: Schema.Types.ObjectId,
      // записываем с какой коллекции данный ид польз
      ref: 'user',
      required: true
    }
  },
  { versionKey: false, timestamps: true }
)

reviewSchema.post('save', handleMongooseError)

const addReviewSchema = Joi.object({
  text: Joi.string().required().max(250),
  rating: Joi.number().required().min(1).max(5)
})

const schemas = {
  reviewSchema,
  addReviewSchema
}
//   создаем модель
const Review = model('review', reviewSchema)

module.exports = { Review, schemas }
