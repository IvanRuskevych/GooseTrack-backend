const express = require('express');

const router = express.Router();

/**
 * Sign-up
 */
router.post('/register');

/**
 * Sign-in
 */
router.post('/login');

/**
 * Current user
 */
router.get('/current');

/**
 * Update user data
 */
router.patch('/user');

/**
 * Logout user
 */
router.post('/logout');

module.exports = router;
