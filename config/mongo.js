const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

function isPlaceholder(u) {
  return /[<>]/.test(u) || u.includes("<") || u.includes(">");
}

if (!uri) {
  console.warn('MONGODB_URI not set. Skipping MongoDB connection.');
  module.exports = null;
} else if (isPlaceholder(uri)) {
  console.error('MONGODB_URI contains placeholder values. Please set a valid URI in .env (remove <>).');
  module.exports = null;
} else if (uri.startsWith('mongodb+srv://') && /:[0-9]+/.test(uri)) {
  console.error('Invalid mongodb+srv URI: it must not contain a port number. Please remove the port from MONGODB_URI.');
  module.exports = null;
} else {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });

  module.exports = mongoose;
}
