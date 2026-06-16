const { exec } = require('child_process')
const path = require('path')

const dest = process.argv[2] || path.join(__dirname, '..', 'db')
const dataset = process.argv[3] || 'jessemostipak/hotel-booking-demand'

function ensureDir(p){
  const fs = require('fs')
  if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

ensureDir(dest)

exec('kaggle --version', (err) => {
  if(err){
    console.error('Kaggle CLI not found. Install it and provide an API token:')
    console.error('- Install: pip install kaggle')
    console.error("- Create API token on Kaggle and save as ~/.kaggle/kaggle.json (or set KAGGLE_USERNAME and KAGGLE_KEY)")
    process.exit(1)
  }

  console.log(`Downloading dataset ${dataset} to ${dest} ...`)
  const cmd = `kaggle datasets download -d ${dataset} -p "${dest}" --unzip --force`
  const dl = exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    if(err){
      console.error('Download failed:', stderr || err.message)
      process.exit(1)
    }
    console.log(stdout)
    console.log('Download finished.')
    // list downloaded files
    const fs = require('fs')
    const files = fs.readdirSync(dest)
    console.log('Files in', dest, ':', files.join(', '))
    process.exit(0)
  })

  dl.stdout.pipe(process.stdout)
  dl.stderr.pipe(process.stderr)
})
