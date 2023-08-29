const express = require('express');
const router = express.Router();

const { schemas } = require('../../models/user');
const { validateBody, authenticate, upload, passport } = require('../../middlewares');
const ctrll = require('../../controllers/controllersAuth');
const { updateUser, current } = require('../../controllers/controllersUsers');

/**
 * Google Sign-up
 */
// якщо запит прийшов на адресу "/google", то застосовуй стратегію "google"
//  scope - налаштування яке вказує що потрібно повернути з google
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  ctrll.googleAuth
);

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

// ====================================================================

/**
 * Current user
 */
router.get('/current', authenticate, current);

/**
 * Update user data
 */
router.patch(
  '/user',
  // isValidId,
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
