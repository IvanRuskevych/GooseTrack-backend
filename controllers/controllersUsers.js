const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs/promises');

const { ctrlWrapper, avatarResize } = require('../utils');
const { User } = require('../models/user');

const avatarDir = path.join(__dirname, '../', 'public', 'avatars');

const updateUser = async (req, res) => {
  console.log('update');
  console.log(req.user);

  const { _id } = req.user;
  let updatedUser = {};

  if (req.body) {
    if (req.body.password) {
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      updatedUser = { ...req.body, password: hashPassword };
    } else {
      updatedUser = { ...req.body };
    }
  }

  // якщо у req є file з аватаром, то завантажує зображення, змінює його розмір на 250x250 пікселів та зберігає його за тим самим шляхом
  if (req.file) {
    const { path: tmpUploadPath, originalname } = req.file;

    const uniqueFilename = `${_id}_${originalname}`;
    const resultUploadPath = path.join(avatarDir, uniqueFilename);
    const avatarURL = path.join('avatars', uniqueFilename);

    await avatarResize(tmpUploadPath);

    await fs.rename(tmpUploadPath, resultUploadPath);

    updatedUser = { ...updatedUser, avatarURL };
    await User.findByIdAndUpdate(_id, { avatarURL: avatarURL });
  }
  // якщо аватару не було то оновлюю user
  await User.findByIdAndUpdate(_id, { ...updatedUser });

  //   if (req.body.password) {
  //     updatedUser = { ...updatedUser, password: req.body.password };
  //   }

  res.status(200).json({
    user: updatedUser,
  });
};

module.exports = {
  updateUser: ctrlWrapper(updateUser),
};
