const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountNumber: {
    type: String,
    unique: true,
    required: true,
  },
  accountType: {
    type: String,
    enum: ['savings', 'current'],
    default: 'savings',
  },
  balance: {
    type: Number,
    default: 0.00,
    min: 0,
  },
  currency: {
    type: String,
    default: 'NGN',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

accountSchema.pre('save', function (next) {
  if (!this.accountNumber) {
    this.accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }
  next();
});

module.exports = mongoose.model('Account', accountSchema);
