const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')
const cityModel = require('../models/cityModel')

const fileArg = process.argv[2] || path.join(__dirname, '..', 'db', 'cities.csv')

async function load(){
  if(!fs.existsSync(fileArg)){
    console.error('CSV file not found:', fileArg)
    process.exit(1)
  }

  const parser = fs.createReadStream(fileArg).pipe(parse({ columns: true, skip_empty_lines: true }))
  const rows = []
  for await (const record of parser){
    // Normalize fields
    const row = {
      id: record.id || null,
      city: record.city || null,
      country: record.country || null,
      region: record.region || null,
      short_description: record.short_description || null,
      latitude: record.latitude ? parseFloat(record.latitude) : null,
      longitude: record.longitude ? parseFloat(record.longitude) : null,
      avg_temp_monthly: tryParseJSON(record.avg_temp_monthly),
      ideal_durations: tryParseJSON(record.ideal_durations),
      budget_level: record.budget_level || null,
      culture: toInt(record.culture),
      adventure: toInt(record.adventure),
      nature: toInt(record.nature),
      beaches: toInt(record.beaches),
      nightlife: toInt(record.nightlife),
      cuisine: toInt(record.cuisine),
      wellness: toInt(record.wellness),
      urban: toInt(record.urban),
      seclusion: toInt(record.seclusion)
    }
    rows.push(row)
  }

  console.log(`Parsed ${rows.length} rows — inserting into database...`)
  try{
    await cityModel.bulkInsert(rows)
    console.log('Import completed')
    process.exit(0)
  }catch(e){
    console.error('Import failed:', e)
    process.exit(1)
  }
}

function tryParseJSON(text){
  if(!text) return null
  try{
    return JSON.parse(text)
  }catch(e){
    // sometimes the field is stored with single quotes or invalid JSON; return as string
    return text
  }
}

function toInt(v){
  if(v === undefined || v === null || v === '') return null
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? null : n
}

load()
