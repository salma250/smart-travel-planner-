const cityModel = require('../models/cityModel')

async function getCities(req, res, next){
  try{
    const rows = await cityModel.getAll()
    res.json(rows)
  }catch(err){
    next(err)
  }
}

module.exports = { getCities }
