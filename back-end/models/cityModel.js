const db = require('../config/db')

async function insertCity({id,city,country,region,short_description,latitude,longitude,avg_temp_monthly,ideal_durations,budget_level,culture,adventure,nature,beaches,nightlife,cuisine,wellness,urban,seclusion}){
  const res = await db.query(
    `INSERT INTO cities(id,city,country,region,short_description,latitude,longitude,avg_temp_monthly,ideal_durations,budget_level,culture,adventure,nature,beaches,nightlife,cuisine,wellness,urban,seclusion)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     ON CONFLICT (id) DO UPDATE SET city = EXCLUDED.city RETURNING *`,
    [id,city,country,region,short_description,latitude,longitude,avg_temp_monthly,ideal_durations,budget_level,culture,adventure,nature,beaches,nightlife,cuisine,wellness,urban,seclusion]
  )
  return res.rows[0]
}

async function bulkInsert(rows){
  const client = await db.pool.connect()
  try{
    await client.query('BEGIN')
    for(const r of rows){
      await client.query(
        `INSERT INTO cities(id,city,country,region,short_description,latitude,longitude,avg_temp_monthly,ideal_durations,budget_level,culture,adventure,nature,beaches,nightlife,cuisine,wellness,urban,seclusion)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO UPDATE SET city = EXCLUDED.city`,
        [r.id,r.city,r.country,r.region,r.short_description,r.latitude,r.longitude,r.avg_temp_monthly,r.ideal_durations,r.budget_level,r.culture,r.adventure,r.nature,r.beaches,r.nightlife,r.cuisine,r.wellness,r.urban,r.seclusion]
      )
    }
    await client.query('COMMIT')
  }catch(e){
    await client.query('ROLLBACK')
    throw e
  }finally{
    client.release()
  }
}

async function getAll(){
  const res = await db.query('SELECT * FROM cities ORDER BY city')
  return res.rows
}

module.exports = { insertCity, bulkInsert, getAll }
