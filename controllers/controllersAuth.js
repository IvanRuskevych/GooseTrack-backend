const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;

const { User } = require('../models/user');

const { customError, ctrlWrapper, sendEmail, CustomError } = require('../utils');

const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY, BASE_URL } = process.env;

// Функція яка обробляє запит POST для реєстрації користувача.

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw customError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  // verificationToken & verifyEmail for send email (SendGrid)
  const verificationToken = uuid();
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

  console.log('USER');
  console.log(user.id);
  const userLogin = { email: user.email, subscription: user.subscription };

  const payload = {
    id: user.id,
  };

  // const token = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: '23h' }); Іван замінив на accessToken
  // await User.findByIdAndUpdate(user._id, { token }); Іван замінив на accessToken

  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: '3m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: '7d' });

  await User.findByIdAndUpdate(user._id, { accessToken, refreshToken });

  res.json({
    // token, Іван замінив на accessToken
    user: userLogin,

    accessToken,
    refreshToken,
  });
};

/*
 * ==== for send email (SendGrid) ============================
 */
const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw CustomError(404, 'User not found');
  }

  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

  res.status(200).json({ message: 'Verification successful' });
};

/*
 * ==== for send email (SendGrid) ============================
 */
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

/*
 * ==== for refresh token ====================================
 */
const refresh = async (req, res) => {
  const { refreshToken: token } = req.body;

  const { id } = jwt.verify(token, REFRESH_SECRET_KEY);
  const isExist = await User.findOne({ refreshToken: token });


// Функція для перевірки дійсності токена

const current = async (req, res) => {
    const { email, subscription } = req.user;

    res.json({ email, subscription })
}

// Функція для розлогінення користувача

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204, "No content").json();
}




  if (!isExist) throw CustomError(403, 'Token does not valid');

  const payload = {
    id,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: '23h' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: '23h' });

  await User.findByIdAndUpdate(id, { accessToken, refreshToken });

  res.status(200).json({
    accessToken,
    refreshToken,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
      current: ctrlWrapper(current),
    logout: ctrlWrapper(logout),

  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),


  refresh: ctrlWrapper(refresh),
};


