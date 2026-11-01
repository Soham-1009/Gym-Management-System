const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide payment amount'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer'],
      required: [true, 'Please provide payment method'],
      default: 'cash',
    },
    transactionId: {
      type: String,
      default: function () {
        return 'TXN-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
      },
    },
    invoiceNumber: {
      type: String,
      unique: true,
      default: function () {
        return 'INV-' + new Date().getFullYear() + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
      },
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
