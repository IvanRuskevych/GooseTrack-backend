const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../utils");

const timeRegexp = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegexp = /^\d{4}-\d{2}-\d{2}$/;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    start: {
      type: String,
      required: [true, "Start is required"],
      match: timeRegexp,
    },
    end: {
      type: String,
      required: [true, "End is required"],
      match: timeRegexp,
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
      match: dateRegexp,
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

// * Проверка, чтоб пользователь не указывал завершение задачи раньше ее начала (start < end)
const validateStartEndTime = (obj, helpers) => {
  function toMinute(time) {
    const arrTime = time.split(":");
    return Number(arrTime[0]) * 60 + Number(arrTime[1]);
  }
  const { start, end } = obj;

  if (toMinute(start) >= toMinute(end)) {
    return helpers.error("any.invalid");
  }
};

const addTaskSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Title is required",
  }),
  start: Joi.string().required().pattern(timeRegexp).messages({
    "any.required": "Start is required",
    "string.pattern.base": "Start must be in the format HH:mm",
  }),
  end: Joi.string().required().pattern(timeRegexp).messages({
    "any.required": "End is required",
    "string.pattern.base": "End must be in the format HH:mm",
  }),
  priority: Joi.string()
    .required()
    .valid("low", "medium", "high")
    .default("low")
    .messages({
      "any.required": "Priority is required",
      "any.only": 'Priority must be one of "low", "medium", or "high"',
    }),
  date: Joi.string().required().pattern(dateRegexp).messages({
    "any.required": "Date is required",
    "string.pattern.base": "Date must be in the format YYYY-MM-DD",
  }),
  category: Joi.string()
    .required()
    .valid("to-do", "in-progress", "done")
    .default("to-do")
    .messages({
      "any.required": "Category is required",
      "any.only": 'Category must be one of "to-do", "in-progress", or "done"',
    }),
  owner: Joi.string(),
})
  .custom(validateStartEndTime)
  .messages({
    "any.invalid": `The following condition must be met start<end`,
  });

const updateCategorySchema = Joi.object({
  category: Joi.string().valid("to-do", "in-progress", "done").required(),
});

const schemas = {
  updateCategorySchema,
  addTaskSchema,
};

const Task = model("task", taskSchema);

module.exports = {
  Task,
  schemas,
};
