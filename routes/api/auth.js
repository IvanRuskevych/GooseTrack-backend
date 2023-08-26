const express = require('express');

const ctrl = require('../../controllers/controllersAuth');

const { validateBody } = require('../../middlewares');

const { schemas } = require('../../models/user');

const router = express.Router();

// Маршрут для реєстрації користувача (signup routes)

router.post('/register', validateBody(schemas.registerSchema), ctrl.register);

// Маршрути для верифікації через email (SendGrid))

router.get('/verify/:verificationToken', ctrl.verifyEmail);
router.post('/verify', validateBody(schemas.schemaEmail), ctrl.resendVerifyEmail);

// Маршрут для авторизації користувача (signin routes)

router.post('/login', validateBody(schemas.loginSchema), ctrl.login);

module.exports = router;
