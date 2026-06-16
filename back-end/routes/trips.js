const express = require('express')
const router = express.Router()
const { createTrip, getTrip, getAll } = require('../controllers/tripsController')
const auth = require('../middleware/auth')
const { validateTrip } = require('../middleware/validate')

router.post('/', auth, validateTrip, createTrip)
router.get('/:id', auth, getTrip)
router.get('/', getAll)

module.exports = router
