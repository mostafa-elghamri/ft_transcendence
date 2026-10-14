const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    email: {type: String, unique: true},
    password: String,
    // _id: String
}));

module.exports = User;