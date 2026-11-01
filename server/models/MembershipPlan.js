const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide membership plan name'],
      trim: true,
      unique: true,
    },
    durationMonths: {
      type: Number,
      required: [true, 'Please provide duration in months'],
      min: [1, 'Duration must be at least 1 month'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide plan price'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
