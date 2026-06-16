const express = require('express')
const router = express.Router()
const { createPost, getPosts } = require('../controllers/postsController')
const auth = require('../middleware/auth')

router.post('/', auth, createPost)
router.get('/', getPosts)

module.exports = router
