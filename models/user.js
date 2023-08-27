const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require('../utils');

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Set name for user'],
    },
    email: {
      type: String,
      match: emailRegexp,
      unique: [true, 'Duplicated email'],
      required: [true, 'Email is required'],
    },
    password: {
      type: String,
      minlength: 6,
      required: [true, 'Set password for user'],
    },

    accessToken: String,
    refreshToken: String,

    // for SendGrid
    verify: {
      type: Boolean,
      default: false,
    },
    // for SendGrid
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post('save', handleMongooseError);

const registerSchema = Joi.object({
  name: Joi.string().max(28).required().messages({
    'any.required': 'Missing required <name> field',
    'string.empty': 'Field <name> cannot be an empty string',
  }),
  email: Joi.string().pattern(emailRegexp).required().messages({
    'any.required': 'Missing required <email> field',
    'string.empty': 'Field <email> cannot be an empty string',
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Missing required <password> field',
    'string.empty': 'Field <password> cannot be an empty string',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    'any.required': 'Missing required <email> field',
    'string.empty': 'Field <email> cannot be an empty string',
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Missing required <password> field',
    'string.empty': 'Field <password> cannot be an empty string',
  }),
});

// for SendGrid
const schemaEmail = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    'any.required': 'Missing required <email> field',
    'string.empty': 'Field <email> cannot be an empty string',
  }),
});

// for refresh token
const schemaRefreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().max(28),
  email: Joi.string().pattern(emailRegexp),
  password: Joi.string(),
  birthday: Joi.date().allow('').optional(),
  phone: Joi.string().max(20).allow('').optional(),
  skype: Joi.string().max(16).allow(''),
});

const schemas = {
  registerSchema,
  loginSchema,

  schemaEmail,
  schemaRefreshToken,
  updateUserSchema,
};

const User = model('user', userSchema);

module.exports = {
  User,
  schemas,
};
