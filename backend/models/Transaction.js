const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'transfer'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
  fromAccount: {
    type: String,
  },
  toAccount: {
    type: String,
  },
  recipientName: {
    type: String,
  },
  reference: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.pre('save', function (next) {
  if (!this.reference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.reference = `TXN${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
