const express = require('express');
const cloudinary = require('cloudinary');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Проверка настройки Cloudinary переменных окружения
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("Cloudinary environment variables are not properly set.");
  process.exit(1);
}

// Настройка Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Модель пользователя
const User = mongoose.model('User', {
  // ...
});

app.use(express.json());

app.patch('/auth/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('req.params.id', userId);

    const user = await User.findById(userId);
    console.log('Fetching user from database...', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('Fetched user:', user);

    // Обновление пользователя (ваш код здесь)

    console.log('Updated user:', user);

    // Обновление пользователя в базе данных (ваш код здесь)

    console.log('Updating user in database with updated data:', user);

    // Отправка ответа
    res.status(200).json({ user: { password: '' } });
    console.log('Sending response:', { user: { password: '' } });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'An error occurred while updating user.' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running. Use our API on port: ${port}`);
});
