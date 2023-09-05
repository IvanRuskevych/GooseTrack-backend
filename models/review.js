// SCHEMAS FOR OBJECT VALIDATION (MongoDB-Mongoose)

// reviewSchema: Validation for what is saved in the database. Pre-save validation.
const { Schema, model } = require('mongoose')
const { handleMongooseError } = require('../utils')

const Joi = require('joi')

const reviewSchema = new Schema(
  {
    text: { type: String, default: '', required: true, maxlength: 250 }, // Maximum of 250 characters in the review.
    rating: { type: Number, default: 0, required: true, min: 1, max: 5 }, // Rating from 1 to 5 stars.

    owner: {
      // String to store the user's ID.
      type: Schema.Types.ObjectId,
      // Record which collection this user ID is from.
      ref: 'user',
      required: true
    }
  },
  { versionKey: false, timestamps: true }
)

reviewSchema.post('save', handleMongooseError)

// addReviewSchema: JOI schema for validating data coming from the frontend.
const addReviewSchema = Joi.object({
  text: Joi.string().required().max(250),
  rating: Joi.number().required().min(1).max(5)
})

const schemas = {
  reviewSchema,
  addReviewSchema
}

// Create the model.
const Review = model('review', reviewSchema)

module.exports = { Review, schemas }
