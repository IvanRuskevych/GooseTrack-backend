const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;

const { User } = require('../models/user');

const { customError, ctrlWrapper, sendEmail, CustomError } = require('../utils');

const { SECRET_KEY, BASE_URL } = process.env;

// Функція яка обробляє запит POST для реєстрації користувача.

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw customError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  // verificationToken + verifyEmail for send email (SendGrid)
  const verificationToken = uuid(); // for send email (SendGrid)
  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click verify email</a>`,
  };

  const newUser = await User.create({ ...req.body, password: hashPassword, verificationToken });

  const userRegister = { email: newUser.email, subscription: newUser.subscription };

  const object = { user: userRegister };

  // for send email (SendGrid)
  sendEmail(verifyEmail);

  res.status(201).json(object);
};

// Функція яка обробляє запит POST для авторизації користувача.

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw customError(401, 'Email or password wrong.');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw customError(401, 'Email or password wrong.');
  }

  const userLogin = { email: user.email, subscription: user.subscription };

  const payload = {
    id: user.id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: userLogin,
  });
};

// for send email (SendGrid)
const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw CustomError(404, 'User not found');
  }

  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

  res.status(200).json({ message: 'Verification successful' });
};

// for send email (SendGrid)
const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw CustomError(401, 'Email or password is wrong');
  }

  if (user.verify) {
    throw CustomError(400, 'Verification has already been passed');
  }

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(200).json({
    message: 'Verification email sent',
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),

  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
