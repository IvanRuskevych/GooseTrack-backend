const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY, BASE_URL } = process.env;

const { User } = require('../models/user');

const { CustomError, ctrlWrapper, avatarResize, sendEmail } = require('../utils');

const avatarDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email });

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = uuidv4();

  if (user) {
    throw CustomError(409, 'Email in use');
  }

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="${BASE_URL}/auth/verify/${verificationToken}">Click verify email</a>`,
  };

  sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      // subscription: newUser.subscription,
    },
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw CustomError(404, 'User not found');
  }

  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

  res.status(200).json({ message: 'Verification successful' });
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

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="${BASE_URL}/auth/verify/${user.verificationToken}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(200).json({
    message: 'Verification email sent',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log('user--->>>', user);

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

  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: '7d' });

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

const refresh = async (req, res) => {
  const { refreshToken: token } = req.body;

  const { id } = jwt.verify(token, REFRESH_SECRET_KEY);
  const isExist = await User.findOne({ refreshToken: token });

  if (!isExist) throw CustomError(403, 'Token does not valid');

  const payload = {
    id,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: '7d' }); // 23h
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: '7d' }); // 23h

  await User.findByIdAndUpdate(id, { accessToken, refreshToken });

  res.status(200).json({
    accessToken,
    refreshToken,
    // user: {
    //   email: user.email,
    //   subscription: user.subscription,
    // },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { accessToken: '', refreshToken: '' });

  // res.status(204).json();
  res.json({
    msg: 'Logout success',
  });
};

const current = async (req, res) => {
  const { email, subscription } = req.user;

  res.status(200).json({ email, subscription });
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

  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),

  login: ctrlWrapper(login),
  refresh: ctrlWrapper(refresh),

  logout: ctrlWrapper(logout),

  current: ctrlWrapper(current),

  updateAvatar: ctrlWrapper(updateAvatar),
};
