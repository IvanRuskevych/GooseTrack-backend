const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require('../utils');
const userRolesEnum = require('../constants');

// eslint-disable-next-line no-useless-escape
const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
// const dateRegexp = /^(?:(?:0[1-9]|[12][0-9]|3[01])\/(?:0[1-9]|1[0-2])\/(?:19|20)\d\d)?$/;
// const phoneRegexp = /^38\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}$/;

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
