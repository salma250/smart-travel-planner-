const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASS || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT||5432}/${process.env.DB_NAME||'smarttravel'}`,
})

module.exports = {
  query: (text, params)=> pool.query(text, params),
  pool
}
