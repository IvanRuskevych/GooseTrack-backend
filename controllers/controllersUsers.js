const bcrypt = require('bcrypt');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

const { ctrlWrapper } = require('../utils');
const { User } = require('../models/user');
const { errorUpdateEmail } = require('../services');

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const updateUser = async (req, res) => {
  const { id } = req.user;

  // const { email } = req.body;
  // const userExists = await User.exists({ email, _id: { $ne: id } });
  // if (userExists) throw CustomError(409, 'User with this email exists..');
  await errorUpdateEmail(req.body.email, id);

  let updatedUser = {};

  if (req.body) {
    if (req.body.password) {
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      updatedUser = { ...req.body, password: hashPassword };
    } else {
      updatedUser = { ...req.body };
    }
  }

  if (req.file) {
    const { path: tmpUploadPath, originalname } = req.file;

    const uniqueFilename = `${id}_${originalname}`;

    const cloudinaryUploadResponse = await cloudinary.uploader.upload(tmpUploadPath, {
      public_id: `avatars/${uniqueFilename}`,
      transformation: { width: 250, height: 250, crop: 'fill' },
    });

    updatedUser = { ...updatedUser, avatarURL: cloudinaryUploadResponse.secure_url };
  }

  await User.findByIdAndUpdate(id, { ...updatedUser }, { new: true });

  const user = await User.findById(id).select('name email birthday phone skype avatarURL -_id');

  res.status(200).json({
    user,
  });
};

const current = async (req, res) => {
  const { name, email, birthday, phone, skype, avatarURL } = req.user;

  res.status(200).json({ name, email, birthday, phone, skype, avatarURL });
};

module.exports = {
  updateUser: ctrlWrapper(updateUser),
  current: ctrlWrapper(current),
};
