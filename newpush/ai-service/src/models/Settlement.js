const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  fromUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  toUser:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  group:     { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  amount:    { type: Number, required: true, min: 0 },
  date:      { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settlement', settlementSchema);