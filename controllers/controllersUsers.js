// const bcrypt = require('bcrypt');
// const { v2: cloudinary } = require('cloudinary');
// require('dotenv').config();

// const { ctrlWrapper, CustomError } = require('../utils');
// const { User } = require('../models/user');

// // Проверка настройки Cloudinary переменных окружения
// if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
//   console.error("Cloudinary environment variables are not properly set.");
//   process.exit(1);
// }

// // Настройка Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// console.log('Cloudinary API config:');
// console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
// console.log('API_KEY:', process.env.CLOUDINARY_API_KEY);
// console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET);

// const updateUser = async (req, res) => {
//   try {
//     console.log('req.params.id', req.params.id);

//     const userId = req.params.id;

//     const isUserExists = await User.findById(userId);

//     console.log('isUserExists--->>', isUserExists);

//     if (!isUserExists) {
//       throw CustomError(404, 'User not found');
//     }

//     const { id } = req.user;

//     let updatedUser = {};

//     if (req.body) {
//       if (req.body.password) {
//         const hashPassword = await bcrypt.hash(req.body.password, 10);
//         updatedUser = { ...req.body, password: hashPassword };
//       } else {
//         updatedUser = { ...req.body };
//       }
//       console.log('Updated user:', updatedUser);
//     }

//     let cloudinaryUploadResponse = null; // Инициализация переменной

//     if (req.body.imageUrl) {
//       const imageUrl = req.body.imageUrl;

//       console.log('Image URL from request:', imageUrl);

//       cloudinaryUploadResponse = await cloudinary.uploader.upload(imageUrl, {
//         public_id: `avatars/${id}_avatar_from_url`,
//         transformation: { width: 250, height: 250, crop: 'fill' },
//       });

//       console.log('Cloudinary response for URL image:', cloudinaryUploadResponse);

//       updatedUser = { ...updatedUser, avatarURL: cloudinaryUploadResponse.secure_url };

//       console.log('Updating user in database with new avatar URL from URL:', cloudinaryUploadResponse.secure_url);

//       await User.findByIdAndUpdate(
//         id,
//         { avatarURL: cloudinaryUploadResponse.secure_url },
//         { new: true }
//       );
//     }

//     if (req.file) {
//       const { path: tmpUploadPath, originalname } = req.file;
//       const uniqueFilename = `${id}_${originalname}`;

//       console.log('Uploading avatar to Cloudinary:', tmpUploadPath);

//       cloudinaryUploadResponse = await cloudinary.uploader.upload(tmpUploadPath, {
//         public_id: `avatars/${uniqueFilename}`,
//         transformation: { width: 250, height: 250, crop: 'fill' },
//       });

//       console.log('Cloudinary response:', cloudinaryUploadResponse);

//       updatedUser = { ...updatedUser, avatarURL: cloudinaryUploadResponse.secure_url };

//       console.log('Updating user in database with new avatar URL:', cloudinaryUploadResponse.secure_url);

//       await User.findByIdAndUpdate(
//         id,
//         { avatarURL: cloudinaryUploadResponse.secure_url },
//         { new: true }
//       );
//     }

//     console.log('Updating user in database with updated data:', updatedUser);

//     const responseUser = { ...updatedUser, password: '' };

//     if (cloudinaryUploadResponse) {
//       responseUser.avatarURL = cloudinaryUploadResponse.secure_url;
//     }

//     console.log('Sending response:', responseUser);

//     res.status(200).json({
//       user: responseUser,
//     });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({ message: 'An error occurred while updating user.' });
//   }
// };

// module.exports = {
//   updateUser: ctrlWrapper(updateUser),
// };




// работает загрузка и приходит ответ от cloudinary, но не работает постман

const bcrypt = require('bcrypt'); // Модуль для хеширования паролей
const { v2: cloudinary } = require('cloudinary'); // Модуль Cloudinary для работы с изображениями
require('dotenv').config(); // Загрузка переменных окружения из файла .env

const { ctrlWrapper, CustomError } = require('../utils');
const { User } = require('../models/user');

// Проверка настройки Cloudinary переменных окружения
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("Cloudinary environment variables are not properly set.");
  process.exit(1);
}

//  Настройка Cloudinary с использованием переменных окружения
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary API config:');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET);

const updateUser = async (req, res) => {
  try {
    console.log('req.params.id', req.params.id);
 // Получение ID пользователя из параметра запроса
    const userId = req.params.id;
  // Поиск пользователя по ID в базе данных
    const isUserExists = await User.findById(userId);

    console.log('isUserExists--->>', isUserExists);
 // Если пользователь не найден, бросаем ошибку 404
    if (!isUserExists) {
      throw CustomError(404, 'User not found');
    }
   // Получение ID текущего пользователя
    const { id } = req.user;
   // Инициализация объекта для обновления пользователя
    let updatedUser = {};
 // Если в запросе есть изменения (например, обновление пароля)
    if (req.body) {
      if (req.body.password) {
         // Хеширование нового пароля
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        updatedUser = { ...req.body, password: hashPassword };
      } else {
        updatedUser = { ...req.body };
      }
      console.log('Updated user:', updatedUser);
    }
   // Инициализация переменной для ответа Cloudinary
    let cloudinaryUploadResponse = null; 

    // Заменить ссылку ниже на ссылку изображения для загрузки
    const imageUrl = "https://img.freepik.com/premium-vector/avatars-with-different-emotions-girl-with-pink-curlers-and-yellow-patches-fashion-avatar-in-flat-vector-art_427567-1535.jpg";

    // Загрузка изображения на Cloudinary
    cloudinaryUploadResponse = await cloudinary.uploader.upload(imageUrl, {
      public_id: `avatars/${id}_avatar`,
      transformation: { width: 250, height: 250, crop: 'fill' },
    });

    console.log('Cloudinary response:', cloudinaryUploadResponse);
    // Обновление объекта пользователя с новым URL аватара
    updatedUser = { ...updatedUser, avatarURL: cloudinaryUploadResponse.secure_url };

    console.log('Updating user in database with new avatar URL:', cloudinaryUploadResponse.secure_url);

    await User.findByIdAndUpdate(
      id,
      { avatarURL: cloudinaryUploadResponse.secure_url },
      { new: true }
    );

    console.log('Updating user in database with updated data:', updatedUser);
 // Обновление URL аватара пользователя в базе данных
    await User.findByIdAndUpdate(id, { ...updatedUser }, { new: true });

    console.log('User updated successfully.');
// данные пользователя для отправки в ответе клиенту. пароль пользователя (если он был в запросе) устанавливается в пустую строку ('') для безовасности
    const responseUser = { ...updatedUser, password: '' };
// если было успешно загружено на cloudinary, URL аватара (secure_url) из ответа Cloudinary присваивается свойству avatarURL
    if (cloudinaryUploadResponse) {
      responseUser.avatarURL = cloudinaryUploadResponse.secure_url;
    }

    console.log('Sending response:', responseUser);

    res.status(200).json({
      user: responseUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'An error occurred while updating user.' });
  }
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
