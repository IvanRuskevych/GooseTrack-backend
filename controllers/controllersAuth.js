const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs').promises;
const uuid = require('uuid').v4;

const { REFRESH_SECRET_KEY, BASE_URL, FRONTEND_URL } = process.env;

const { User } = require('../models/user');

const { CustomError, ctrlWrapper, avatarResize, sendEmail } = require('../utils');
const { createTokens } = require('../services/servicesToken');
const htmlEmailVerify = require('../views/emailVerify');

const avatarDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email });

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = uuid();

  if (user) {
    throw CustomError(409, 'Email in use');
  }

  await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
    verificationToken,
  });

  const urlVerify = `${BASE_URL}/auth/verify/${verificationToken}`;

  const verifyEmail = {
    to: email,
    subject: 'Email verify instruction',
    html: htmlEmailVerify(urlVerify),
  };

  sendEmail(verifyEmail);

  res.status(201).json({
    message: 'Verification letter was send to you email.',
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw CustomError(404, 'User not found');
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.status(200).redirect(`${FRONTEND_URL}/login`);
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw CustomError(401, 'Email or password is wrong');
  }

  if (user.verify) {
    throw CustomError(400, 'Verification has already been passed');
  }

  const urlVerify = `${BASE_URL}/auth/verify/${user.verificationToken}`;

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: htmlEmailVerify(urlVerify),
  };

  await sendEmail(verifyEmail);

  res.status(200).redirect(`${FRONTEND_URL}/login`);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw CustomError(401, 'Email or password is wrong');
  }

  if (!user.verify) {
    throw CustomError(404, 'User not found');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw CustomError(401, 'Email or password is wrong');
  }

  const payload = {
    id: user._id,
  };

  const { accessToken, refreshToken } = createTokens(payload);

  await User.findByIdAndUpdate(user._id, { accessToken, refreshToken });

  res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const googleAuth = async (req, res) => {
  const { _id: id } = req.user;

  const payload = {
    id,
  };

  const { accessToken, refreshToken } = createTokens(payload);

  await User.findByIdAndUpdate(id, { accessToken, refreshToken, verificationToken: null });

  res.redirect(`${FRONTEND_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`); // FE має сказати на яку сторінку слід перекинути зареєстрованого/залошіненого юзера
};

const refresh = async (req, res) => {
  const { refreshToken: token } = req.body;

  const { id } = jwt.verify(token, REFRESH_SECRET_KEY);
  const isExist = await User.findOne({ refreshToken: token });

  if (!isExist) throw CustomError(403, 'Token does not valid');

  const payload = {
    id,
  };

  const { accessToken, refreshToken } = createTokens(payload);

  await User.findByIdAndUpdate(id, { accessToken, refreshToken }, { new: true });

  res.status(200).json({
    accessToken,
    refreshToken,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { accessToken: '', refreshToken: '' });

  res.status(204).json();
};

const updateAvatar = async (req, res) => {
  const { id } = req.user;
  const { path: tmpUploadPath, originalname } = req.file;

  const uniqueFilename = `${id}_${originalname}`;
  const resultUploadPath = path.join(avatarDir, uniqueFilename);
  const avatarURL = path.join('avatars', uniqueFilename);

  await avatarResize(tmpUploadPath);

  await fs.rename(tmpUploadPath, resultUploadPath);

  await User.findByIdAndUpdate(id, { avatarURL });

  res.status(200).json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  googleAuth: ctrlWrapper(googleAuth),

  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),

  login: ctrlWrapper(login),
  refresh: ctrlWrapper(refresh),

  logout: ctrlWrapper(logout),

  updateAvatar: ctrlWrapper(updateAvatar),
};
