const express = require('express');

const ctrl = require('../../controllers/controllersAuth');

const { validateBody, } = require('../../middlewares');

const { schemas } = require('../../models/user');
const authenticate = require('../../middlewares/authenticate');
const upload = require('../../middlewares/upload');
const { updateUser } = require('../../controllers/controllersUsers');

const router = express.Router();

// Маршрут для реєстрації користувача (signup routes)

router.post('/register', validateBody(schemas.registerSchema), ctrl.register);

// Маршрути для верифікації через email (SendGrid))

router.get('/verify/:verificationToken', ctrl.verifyEmail);
router.post('/verify', validateBody(schemas.schemaEmail), ctrl.resendVerifyEmail);

// Маршрут для авторизації користувача (signin routes)

router.post('/login', validateBody(schemas.loginSchema), ctrl.login);

router.patch(
  '/user/:id',
  authenticate,
  upload.single('avatar'),
  validateBody(schemas.updateUserSchema),
  updateUser
);

// Маршрут для оновлення refreshToken
router.post('/refresh', validateBody(schemas.schemaRefreshToken), ctrl.refresh);

// Маршрут для перевірки дійсності токена

router.get("/verifyToken", authenticate, ctrl.verifyToken);

// Маршрут для розлогінення користувача

router.post("/logout", authenticate, ctrl.logout);

// Маршрут для отримання інформації про користувача за допомогою токена

router.get("/getUserInfo", authenticate, ctrl.getUserInfo);

module.exports = router;
