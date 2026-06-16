require('../config/mongo');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true },
  avatar_url: { type: String },
  created_at: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

module.exports = {
  findByEmail: (email) =>
    User.findOne({ email }).then((user) => ({ rows: user ? [formatUser(user)] : [] })),

  findById: (id) =>
    User.findById(id).then((user) => ({ rows: user ? [formatUser(user)] : [] })),

  create: (name, email, passwordHash) =>
    User.create({ name, email, password_hash: passwordHash }).then((user) => ({ rows: [formatUser(user)] })),
};

function formatUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    password_hash: user.password_hash,
  };
}
