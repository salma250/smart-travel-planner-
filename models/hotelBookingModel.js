const db = require('../config/db')

async function insertBooking(b){
  const res = await db.query(
    `INSERT INTO hotel_bookings(hotel,is_canceled,lead_time,arrival_date_year,arrival_date_month,arrival_date_week_number,arrival_date_day_of_month,stays_in_weekend_nights,stays_in_week_nights,adults,children,babies,meal,country,market_segment,distribution_channel,is_repeated_guest,previous_cancellations,previous_bookings_not_canceled,reserved_room_type,assigned_room_type,booking_changes,deposit_type,agent,company,days_in_waiting_list,customer_type,adr,required_car_parking_spaces,total_of_special_requests,reservation_status,reservation_status_date)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
     ON CONFLICT (id) DO NOTHING RETURNING *`,
    [b.hotel,b.is_canceled,b.lead_time,b.arrival_date_year,b.arrival_date_month,b.arrival_date_week_number,b.arrival_date_day_of_month,b.stays_in_weekend_nights,b.stays_in_week_nights,b.adults,b.children,b.babies,b.meal,b.country,b.market_segment,b.distribution_channel,b.is_repeated_guest,b.previous_cancellations,b.previous_bookings_not_canceled,b.reserved_room_type,b.assigned_room_type,b.booking_changes,b.deposit_type,b.agent,b.company,b.days_in_waiting_list,b.customer_type,b.adr,b.required_car_parking_spaces,b.total_of_special_requests,b.reservation_status,b.reservation_status_date]
  )
  return res.rows[0]
}

async function bulkInsert(rows){
  const client = await db.pool.connect()
  try{
    await client.query('BEGIN')
    for(const r of rows){
      await client.query(
        `INSERT INTO hotel_bookings(hotel,is_canceled,lead_time,arrival_date_year,arrival_date_month,arrival_date_week_number,arrival_date_day_of_month,stays_in_weekend_nights,stays_in_week_nights,adults,children,babies,meal,country,market_segment,distribution_channel,is_repeated_guest,previous_cancellations,previous_bookings_not_canceled,reserved_room_type,assigned_room_type,booking_changes,deposit_type,agent,company,days_in_waiting_list,customer_type,adr,required_car_parking_spaces,total_of_special_requests,reservation_status,reservation_status_date)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
         ON CONFLICT (id) DO NOTHING`,
        [r.hotel,r.is_canceled,r.lead_time,r.arrival_date_year,r.arrival_date_month,r.arrival_date_week_number,r.arrival_date_day_of_month,r.stays_in_weekend_nights,r.stays_in_week_nights,r.adults,r.children,r.babies,r.meal,r.country,r.market_segment,r.distribution_channel,r.is_repeated_guest,r.previous_cancellations,r.previous_bookings_not_canceled,r.reserved_room_type,r.assigned_room_type,r.booking_changes,r.deposit_type,r.agent,r.company,r.days_in_waiting_list,r.customer_type,r.adr,r.required_car_parking_spaces,r.total_of_special_requests,r.reservation_status,r.reservation_status_date]
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

module.exports = { insertBooking, bulkInsert }
