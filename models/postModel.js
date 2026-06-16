const db = require('../config/db')

async function createPost({user_id,image,comment,location}){
  const res = await db.query(
    'INSERT INTO posts(user_id,image,comment,location,created_at) VALUES($1,$2,$3,$4,NOW()) RETURNING *',
    [user_id,image,comment,location]
  )
  return res.rows[0]
}

async function getAll(){
  const res = await db.query('SELECT p.*, u.name FROM posts p LEFT JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC')
  return res.rows
}

module.exports = { createPost, getAll }
