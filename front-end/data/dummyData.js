export const sampleTrip = {
  destination: 'Lisbon, Portugal',
  estimatedCost: '$1,350',
  hotels: [
    {id:1, name:'Lisbon Central Hotel', price:'$120/night', img:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=60'},
    {id:2, name:'River View Suites', price:'$160/night', img:'https://images.unsplash.com/photo-1501117716987-c8e2f0d3b8b3?w=800&q=60'}
  ],
  activities: [
    {id:1, name:'Historic Tram Tour', price:'$25', img:'https://images.unsplash.com/photo-1504280390369-5f5c0f6f6c23?w=800&q=60'},
    {id:2, name:'Fado Night', price:'$40', img:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=60'}
  ],
  itinerary: [
    {day:'Day 1', items:[{time:'09:00', title:'Arrive & check in'},{time:'14:00', title:'Walking tour'}]},
    {day:'Day 2', items:[{time:'10:00', title:'Tram tour'},{time:'19:00', title:'Fado evening'}]}
  ],
  markers: [
    {lat:38.7223, lng:-9.1393, title:'Hotel A'},
    {lat:38.7167, lng:-9.1396, title:'Activity 1'}
  ]
}

export const communityPosts = [
  {id:1, user:'Alice', text:'Amazing sunset in Lisbon!', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=60'},
  {id:2, user:'Marco', text:'Best seafood by the river.', img:'https://images.unsplash.com/photo-1493815793588-29a0d9b1a6d4?w=800&q=60'}
]
