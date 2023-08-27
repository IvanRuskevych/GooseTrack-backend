const express = require('express');
const router = express.Router();

const { schemas } = require('../../models/user');
const { validateBody, authenticate, upload } = require('../../middlewares');
const ctrll = require('../../controllers/controllersAuth');
const { updateUser } = require('../../controllers/controllersUsers');

/**
 * Sign-up
 */
router.post('/register', validateBody(schemas.registerSchema), ctrll.register);

router.get('/verify/:verificationToken', ctrll.verifyEmail);

router.post('/verify', validateBody(schemas.schemaEmail), ctrll.resendVerifyEmail);

/**
 * Sign-in
 */
router.post('/login', validateBody(schemas.loginSchema), ctrll.login);

router.post('/refresh', validateBody(schemas.schemaRefreshToken), ctrll.refresh);

/**
 * Logout user
 */
router.post('/logout', authenticate, ctrll.logout);

/**
 * Current user
 */
router.get('/current', authenticate, ctrll.current);

// ====================================================================

/**
 * Update user data
 */
router.patch(
  '/user/:id',
  authenticate,
  // upload.single('avatar'),
  validateBody(schemas.updateUserSchema),
  updateUser
);

// ====================================================================

/**
 * User avatar
 */
router.patch('/avatar', authenticate, upload.single('avatar'), ctrll.updateAvatar);

module.exports = router;

// ====================================================================
// ====================================================================
// ====================================================================
// const express = require('express');

// const ctrl = require('../../controllers/controllersAuth');
// const { schemas } = require('../../models/user');

// const { validateBody } = require('../../middlewares');
// const authenticate = require('../../middlewares/authenticate');
// const upload = require('../../middlewares/upload');

// const { updateUser } = require('../../controllers/controllersUsers');

// const router = express.Router();

// Маршрут для реєстрації користувача (signup routes)

// router.post('/register', validateBody(schemas.registerSchema), ctrl.register);

// Маршрути для верифікації через email (SendGrid))

// router.get('/verify/:verificationToken', ctrl.verifyEmail);
// router.post('/verify', validateBody(schemas.schemaEmail), ctrl.resendVerifyEmail);

// Маршрут для авторизації користувача (signin routes)

// router.post('/login', validateBody(schemas.loginSchema), ctrl.login);

// // ====================================================================

// router.patch(
//   '/user/:id',
//   authenticate,
//   upload.single('avatar'),
//   validateBody(schemas.updateUserSchema),
//   updateUser
// );

// // ====================================================================

// Маршрут для оновлення refreshToken
// router.post('/refresh', validateBody(schemas.schemaRefreshToken), ctrl.refresh);

// // Маршрут для перевірки дійсності токена
// // ====================================================================

// router.get('/verifyToken', authenticate, ctrl.verifyToken);
// // ====================================================================

// Маршрут для розлогінення користувача

// router.post('/logout', authenticate, ctrl.logout);

// Маршрут для отримання інформації про користувача за допомогою токена

// router.get('/getUserInfo', authenticate, ctrl.getUserInfo);

module.exports = router;
