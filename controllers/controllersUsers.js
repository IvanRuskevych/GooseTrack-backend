const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require('jimp');
const { ctrlWrapper } = require('../utils');
const { User } = require('../models/user');
// const { nanoid } = require('nanoid');

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

  if (req.file) {
    const { path: tempUpload, originalname } = req.file;
    const fileName = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarDir, fileName);

    Jimp.read(tempUpload)
      .then((avatar) => {
        return avatar
          .resize(250, 250) // resize
          .write(resultUpload); // save
      })
      .catch((err) => {
        console.error(err);
      });

    await fs.unlink(tempUpload);
    // console.log(fileName);
    const avatarURL = path.join('avatars', fileName);
    console.log(avatarURL);
    updatedUser = { ...updatedUser, avatarURL };
    await User.findByIdAndUpdate(_id, { avatarURL: avatarURL });
  }
  console.log('body');
  console.log(req.body);
  console.log('');

  console.log('updatedUser');
  console.log(updatedUser);

  await User.findByIdAndUpdate(_id, { ...updatedUser });
  if (req.body.password) {
    updatedUser = { ...updatedUser, password: req.body.password };
  }

  res.status(200).json({
    status: 'success',
    code: 200,
    data: { updatedUser },
  });
};

module.exports = {
  updateUser: ctrlWrapper(updateUser),
};
