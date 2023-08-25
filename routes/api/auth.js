const express = require('express');

const ctrl = require("../../controllers/controllersAuth")

const { validateBody } = require("../../middlewares");

const { schemas } = require("../../models/user");

const router = express.Router();

// Маршрут для реєстрації користувача (signup routes)

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

// Маршрут для авторизації користувача (signin routes)

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);


module.exports = router;