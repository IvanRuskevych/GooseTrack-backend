const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require('../utils');
const userRolesEnum = require('../constants');

// eslint-disable-next-line no-useless-escape
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
      minlength: 8,
      required: [true, 'Set password for user'],
    },
    birthday: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    skype: {
      type: String,
      default: null,
    },
    avatarURL: { type: String },

    accessToken: { type: String },
    refreshToken: { type: String },

    subscription: {
      type: String,
      enum: Object.values(userRolesEnum),
      default: userRolesEnum.USER,
    },

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
    'string.base': 'The name must be a string.',
    'any.required': 'The name field is required.',
    'string.empty': 'The name must not be empty.',
  }),
  email: Joi.string().pattern(emailRegexp).required().messages({
    'string.base': 'The email must be a string.',
    'any.required': 'The email field is required.',
    'string.empty': 'The email must not be empty.',
    'string.pattern.base': 'The email must be in format test@gmail.com.',
  }),
  password: Joi.string().min(8).max(16).required().messages({
    'string.base': 'The password must be a string.',
    'any.required': 'The password field is required.',
    'string.empty': 'The password must not be empty.',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    'string.base': 'The email must be a string.',
    'any.required': 'The email field is required.',
    'string.empty': 'The email must not be empty.',
    'string.pattern.base': 'The email must be in format test@gmail.com.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'The password must be a string.',
    'any.required': 'The password field is required.',
    'string.empty': 'The password must not be empty.',
  }),
});

// for SendGrid
const schemaEmail = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    'string.base': 'The email must be a string.',
    'any.required': 'The email field is required.',
    'string.empty': 'The email must not be empty.',
    'string.pattern.base': 'The email must be in format test@gmail.com.',
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
