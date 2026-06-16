const db = require('../config/db')

async function createTrip({user_id,budget,departure_city,destination,start_date,end_date}){
  const res = await db.query(
    `INSERT INTO trips(user_id,budget,departure_city,destination,start_date,end_date) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [user_id,budget,departure_city,destination,start_date,end_date] 
  )
  return res.rows[0]
}

async function getTrip(id){
  const res = await db.query('SELECT * FROM trips WHERE id=$1', [id])
  return res.rows[0]
}

async function getAll(){
  const res = await db.query('SELECT * FROM trips ORDER BY id DESC')
  return res.rows
}

module.exports = { createTrip, getTrip, getAll }
