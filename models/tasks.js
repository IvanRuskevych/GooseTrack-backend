const { Schema, model } = require("mongoose");
// const Joi = require("joi");
const { handleMongooseError } = require("../helpers");

// timeRegexp =
// dataRegexp =

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    start: {
      type: String,
      required: [true, "Start is required"],
      //   match: timeRegexp,
    },
    end: {
      type: String,
      required: [true, "End is required"],
      //   match: timeRegexp,
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: ["low", "medium", "high"],
      default: "low",
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      //   match: dataRegexp,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["to-do", "in-progress", "done"],
      default: "to-do",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

taskSchema.post("save", handleMongooseError);

// const addSchema = Joi.object({
//   name: Joi.string().min(2).max(30).required().messages({
//     "any.required": "missing required name field",
//   }),
//   email: Joi.string()
//     .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
//     .required()
//     .messages({
//       "any.required": "missing required email field",
//     }),
//   phone: Joi.number()
//     .integer()
//     .required()
//     .messages({
//       "number.base": 'The "phone" field must be a number',
//       "number.integer": "The phone field must be an integer.",
//       "any.required": "missing required phone field",
//     })
//     .custom((value, helpers) => {
//       const phoneNumberRegex = /^\d{7}$/;
//       if (!phoneNumberRegex.test(value)) {
//         return helpers.message(
//           'The "phone" field must be in the format of a phone number and contain at least 7 characters'
//         );
//       }
//     }),
//   favorite: Joi.boolean(),
// });

// const updateFavoriteSchema = Joi.object({
//   favorite: Joi.boolean().required(),
// });

// const schemas = {
//   updateFavoriteSchema,
//   addSchema,
// };

const Task = model("task", taskSchema);

module.exports = {
  Task,
};
