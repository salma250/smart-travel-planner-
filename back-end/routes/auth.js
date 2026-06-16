const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateRegister } = require('../middleware/validate');

router.post('/register', validateRegister, register);
router.post('/login', login);
router.get('/me', auth, getMe);   // protected — returns current user

module.exports = router;