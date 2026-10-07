const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  currency:  { type: String, default: 'درهم' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);