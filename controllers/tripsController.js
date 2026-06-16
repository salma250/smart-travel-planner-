const Trip = require('../models/tripModel')

async function createTrip(req,res,next){
  try{
    const user_id = req.user.id
    const {budget,departure_city,destination,start_date,end_date} = req.body
    const trip = await Trip.createTrip({user_id,budget,departure_city,destination,start_date,end_date})
    res.status(201).json({trip})
  }catch(err){next(err)}
}

async function getTrip(req,res,next){
  try{
    const trip = await Trip.getTrip(req.params.id)
    if(!trip) return res.status(404).json({message:'Not found'})
    res.json({trip})
  }catch(err){next(err)}
}

async function getAll(req,res,next){
  try{
    const trips = await Trip.getAll()
    res.json({trips})
  }catch(err){next(err)}
}

module.exports = { createTrip, getTrip, getAll }
