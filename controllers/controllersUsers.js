const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs/promises');

const { ctrlWrapper, avatarResize } = require('../utils');
const { User } = require('../models/user');

const avatarDir = path.join(__dirname, '../', 'public', 'avatars');

const updateUser = async (req, res) => {
  console.log('updateUser===>>>', req.user.id);

  const { id } = req.user;

  let updatedUser = {};

  if (req.body) {
    // console.log('req.body 001 ===>>', req.body);
    if (req.body.password) {
      // const hashPassword = await bcrypt.hash(req.body.password, 10);
      await bcrypt.hash(req.body.password, 10);
      updatedUser = { ...req.body };
    } else {
      updatedUser = { ...req.body };
    }
  }

  // якщо у req є file з аватаром, то завантажує зображення, змінює його розмір на 250x250 пікселів та зберігає його за тим самим шляхом
  if (req.file) {
    const { path: tmpUploadPath, originalname } = req.file;

    const uniqueFilename = `${id}_${originalname}`;
    const resultUploadPath = path.join(avatarDir, uniqueFilename);
    const avatarURL = path.join('avatars', uniqueFilename);

    await avatarResize(tmpUploadPath);

    await fs.rename(tmpUploadPath, resultUploadPath);

    updatedUser = { ...updatedUser, avatarURL };

    // console.log('updateUser 002===>>>', updatedUser);
    // console.log('id 002====>>>', id);

    await User.findByIdAndUpdate(id, { avatarURL: avatarURL }, { new: true });
  }
  // якщо аватару не було то оновлюю user
  console.log('updateUser 003===>>>', updatedUser);
  console.log('id 003===>>>', id);

  await User.findByIdAndUpdate(id, { ...updatedUser }, { new: true });

  // const qwe = await User.findById(id);

  // console.log('qwe', qwe);

  res.status(200).json({
    user: { ...updatedUser, password: '' },
  });
};

module.exports = {
  updateUser: ctrlWrapper(updateUser),
};
