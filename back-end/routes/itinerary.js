const express = require('express')
const router = express.Router()
const { generateItinerary } = require('../controllers/itineraryController')
const auth = require('../middleware/auth')

router.post('/generate', auth, generateItinerary)

module.exports = router
