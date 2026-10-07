const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description:  { type: String, required: true },
  amount:       { type: Number, required: true, min: 0 },
  payer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  group:        { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  date:         { type: Date, default: Date.now, index: true },
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);