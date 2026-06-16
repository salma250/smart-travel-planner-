// Simple assistant that returns canned responses for keywords
async function chat(req,res,next){
  try{
    const {message} = req.body
    const lower = (message||'').toLowerCase()
    let answer = 'Sorry, I do not know that yet.'
    if(lower.includes('visa')) answer = 'Check the embassy website for up-to-date visa requirements.'
    else if(lower.includes('weather')) answer = 'Check local forecasts 7 days before departure; pack layers.'
    else if(lower.includes('activities')|| lower.includes('places')) answer = 'Try local walking tours, museums, and food markets.'
    else answer = 'I can help with visa, weather, activities, and packing tips.'
    res.json({answer})
  }catch(err){next(err)}
}

module.exports = { chat }
