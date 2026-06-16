const Activity = require('../models/activityModel')

// Mock itinerary generation based on budget and preferences
async function generateItinerary(req,res,next){
  try{
    const {budget, preferences=[]} = req.body
    // Simple mocked logic: return three days with activities tuned to preferences
    const sample = [
      {day:'Day 1', items:[{time:'09:00', title:`Arrival & ${preferences.includes('culture')? 'city tour':'check-in'}`},{time:'14:00', title:'Local lunch'}]},
      {day:'Day 2', items:[{time:'09:00', title:preferences.includes('nature')? 'Hike in park':'Museum visit'},{time:'18:00', title:'Evening market'}]},
      {day:'Day 3', items:[{time:'10:00', title:preferences.includes('adventure')? 'Kayaking':'Free day'},{time:'16:00', title:'Relax & depart'}]},
    ]
    // optionally persist activities if trip_id provided
    if(req.body.trip_id){
      for(const d of sample){
        for(const it of d.items){
          await Activity.createActivity({trip_id:req.body.trip_id,name:it.title,location:'TBD',date:null,price:0})
        }
      }
    }
    res.json({itinerary:sample})
  }catch(err){next(err)}
}

module.exports = { generateItinerary }
