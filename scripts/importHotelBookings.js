const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')
const hotelModel = require('../models/hotelBookingModel')

const fileArg = process.argv[2] || path.join(__dirname, '..', 'db', 'hotel_bookings.csv')

function toInt(v){
  if(v === undefined || v === null || v === '') return null
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? null : n
}

function toFloat(v){
  if(v === undefined || v === null || v === '') return null
  const n = parseFloat(v)
  return Number.isNaN(n) ? null : n
}

function toBool(v){
  if(v === undefined || v === null || v === '') return null
  if(v === '1' || v.toLowerCase() === 'true' ) return true
  if(v === '0' || v.toLowerCase() === 'false') return false
  return null
}

async function load(){
  if(!fs.existsSync(fileArg)){
    console.error('CSV file not found:', fileArg)
    process.exit(1)
  }

  const parser = fs.createReadStream(fileArg).pipe(parse({ columns: true, skip_empty_lines: true }))
  const rows = []
  for await (const record of parser){
    const row = {
      hotel: record.hotel || null,
      is_canceled: toBool(record.is_canceled),
      lead_time: toInt(record.lead_time),
      arrival_date_year: toInt(record.arrival_date_year),
      arrival_date_month: record.arrival_date_month || null,
      arrival_date_week_number: toInt(record.arrival_date_week_number),
      arrival_date_day_of_month: toInt(record.arrival_date_day_of_month),
      stays_in_weekend_nights: toInt(record.stays_in_weekend_nights),
      stays_in_week_nights: toInt(record.stays_in_week_nights),
      adults: toInt(record.adults),
      children: toInt(record.children),
      babies: toInt(record.babies),
      meal: record.meal || null,
      country: record.country || null,
      market_segment: record.market_segment || null,
      distribution_channel: record.distribution_channel || null,
      is_repeated_guest: toBool(record.is_repeated_guest),
      previous_cancellations: toInt(record.previous_cancellations),
      previous_bookings_not_canceled: toInt(record.previous_bookings_not_canceled),
      reserved_room_type: record.reserved_room_type || null,
      assigned_room_type: record.assigned_room_type || null,
      booking_changes: toInt(record.booking_changes),
      deposit_type: record.deposit_type || null,
      agent: record.agent || null,
      company: record.company || null,
      days_in_waiting_list: toInt(record.days_in_waiting_list),
      customer_type: record.customer_type || null,
      adr: toFloat(record.adr),
      required_car_parking_spaces: toInt(record.required_car_parking_spaces),
      total_of_special_requests: toInt(record.total_of_special_requests),
      reservation_status: record.reservation_status || null,
      reservation_status_date: record.reservation_status_date || null
    }
    rows.push(row)
  }

  console.log(`Parsed ${rows.length} rows — inserting into database...`)
  try{
    await hotelModel.bulkInsert(rows)
    console.log('Import completed')
    process.exit(0)
  }catch(e){
    console.error('Import failed:', e)
    process.exit(1)
  }
}

load()
