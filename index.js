require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const app = express()
const port = process.env.PORT || 8000

// middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many attempts, try again later' }
})

// routes
app.use('/api/auth', authLimiter, require('./routes/auth'))
app.use('/api/trips', require('./routes/trips'))
app.use('/api/itinerary', require('./routes/itinerary'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/posts', require('./routes/posts'))
app.use('/api/cities', require('./routes/cities'))

// error handler
const { errorHandler } = require('./middleware/errorHandler')
app.use(errorHandler)

// health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'node' }))

app.get('/', (req, res) => res.send('API is working'))

app.listen(port, ()=>{
  console.log(`Smart Travel Planner API running on port ${port}`)
})