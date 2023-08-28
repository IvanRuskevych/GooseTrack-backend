// const bcrypt = require('bcrypt');
// const path = require('path');
// // const { v2: cloudinary } = require('cloudinary');
// const cloudinary= require('cloudinary').v2;
// const fs = require('fs/promises');
// require('dotenv').config();

// const { ctrlWrapper, avatarResize } = require('../utils');
// const { User } = require('../models/user');

// // Настройка Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const avatarDir = path.join(__dirname, '../', 'public', 'avatars');

// const updateUser = async (req, res) => {
//   console.log('updateUser===>>>', req.user.id);

//   const { id } = req.user;

//   let updatedUser = {};

//   if (req.body) {
//     // console.log('req.body 001 ===>>', req.body);
//     if (req.body.password) {
//       const hashPassword = await bcrypt.hash(req.body.password, 10);
//       updatedUser = { ...req.body, password: hashPassword };
//     } else {
//       updatedUser = { ...req.body };
//     }
//     console.log('Updated user:', updatedUser);
//   }

//   // Если есть файл с аватаром, загружаем его на Cloudinary и обновляем URL аватара
//   if (req.file) {
//     const { path: tmpUploadPath, originalname } = req.file;

//     const uniqueFilename = `${id}_${originalname}`;
//     const resultUploadPath = path.join(avatarDir, uniqueFilename);
//     const avatarURL = path.join('avatars', uniqueFilename);

//     await avatarResize(tmpUploadPath);

//     await fs.rename(tmpUploadPath, resultUploadPath);

//     updatedUser = { ...updatedUser, avatarURL };

//     // console.log('updateUser 002===>>>', updatedUser);
//     // console.log('id 002====>>>', id);

//     await User.findByIdAndUpdate(id, { avatarURL: avatarURL }, { new: true });
//   }
//   // якщо аватару не було то оновлюю user
//   console.log('updateUser 003===>>>', updatedUser);
//   console.log('id 003===>>>', id);

//   await User.findByIdAndUpdate(id, { ...updatedUser }, { new: true });

//   // const qwe = await User.findById(id);

//   // console.log('qwe', qwe);
//   console.log('Updated user in database:', updatedUser);
//   res.status(200).json({
//     user: { ...updatedUser, password: '' },
//   });
// };

// module.exports = {
//   updateUser: ctrlWrapper(updateUser),
// };

const bcrypt = require('bcrypt');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

const { ctrlWrapper } = require('../utils');
const { User } = require('../models/user');

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const updateUser = async (req, res) => {
  console.log('updateUser===>>>', req.user.id);

  const { id } = req.user;

  let updatedUser = {};

  if (req.body) {
    if (req.body.password) {
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      updatedUser = { ...req.body, password: hashPassword };
    } else {
      updatedUser = { ...req.body };
    }
    console.log('Updated user:', updatedUser);
  }

  // Если есть файл с аватаром, загружаем его на Cloudinary и обновляем URL аватара
  if (req.file) {
    const { path: tmpUploadPath, originalname } = req.file;

    const uniqueFilename = `${id}_${originalname}`;

    const cloudinaryUploadResponse = await cloudinary.uploader.upload(tmpUploadPath, {
      public_id: `avatars/${uniqueFilename}`,
      transformation: { width: 250, height: 250, crop: 'fill' },
    });

    updatedUser = { ...updatedUser, avatarURL: cloudinaryUploadResponse.secure_url };

    await User.findByIdAndUpdate(
      id,
      { avatarURL: cloudinaryUploadResponse.secure_url },
      { new: true }
    );
  }

  await User.findByIdAndUpdate(id, { ...updatedUser }, { new: true });
  console.log('Updated user in database:', updatedUser);
  res.status(200).json({
    user: { ...updatedUser, password: '' },
  });
};

module.exports = {
  updateUser: ctrlWrapper(updateUser),
};

// копия без CLOUDINARY
// const bcrypt = require('bcrypt');
// const path = require('path');
// const fs = require('fs/promises');

// const { ctrlWrapper, avatarResize } = require('../utils');
// const { User } = require('../models/user');

// const avatarDir = path.join(__dirname, '../', 'public', 'avatars');

// const updateUser = async (req, res) => {
//   console.log('updateUser===>>>', req.user.id);

//   const { id } = req.user;

//   let updatedUser = {};

//   if (req.body) {
//     // console.log('req.body 001 ===>>', req.body);
//     if (req.body.password) {
//       const hashPassword = await bcrypt.hash(req.body.password, 10);
//       updatedUser = { ...req.body, password: hashPassword };
//     } else {
//       updatedUser = { ...req.body };
//     }
//   }

//   // якщо у req є file з аватаром, то завантажує зображення, змінює його розмір на 250x250 пікселів та зберігає його за тим самим шляхом
//   if (req.file) {
//     const { path: tmpUploadPath, originalname } = req.file;

//     const uniqueFilename = `${id}_${originalname}`;
//     const resultUploadPath = path.join(avatarDir, uniqueFilename);
//     const avatarURL = path.join('avatars', uniqueFilename);

//     await avatarResize(tmpUploadPath);

//     await fs.rename(tmpUploadPath, resultUploadPath);

//     updatedUser = { ...updatedUser, avatarURL };

//     // console.log('updateUser 002===>>>', updatedUser);
//     // console.log('id 002====>>>', id);

//     await User.findByIdAndUpdate(id, { avatarURL: avatarURL }, { new: true });
//   }
//   // якщо аватару не було то оновлюю user
//   console.log('updateUser 003===>>>', updatedUser);
//   console.log('id 003===>>>', id);

//   await User.findByIdAndUpdate(id, { ...updatedUser }, { new: true });

//   // const qwe = await User.findById(id);

//   // console.log('qwe', qwe);

//   res.status(200).json({
//     user: { ...updatedUser, password: '' },
//   });
// };

// module.exports = {
//   updateUser: ctrlWrapper(updateUser),
// };
