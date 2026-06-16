const db = require('../config/db')

async function createActivity({trip_id,name,location,date,price}){
  const res = await db.query(
    'INSERT INTO activities(trip_id,name,location,date,price) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [trip_id,name,location,date,price]
  )
  return res.rows[0]
}

async function getByTrip(trip_id){
  const res = await db.query('SELECT * FROM activities WHERE trip_id=$1 ORDER BY date', [trip_id])
  return res.rows
}

module.exports = { createActivity, getByTrip }
