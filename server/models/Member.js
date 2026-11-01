const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'inactive', 'pending'],
      default: 'active',
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

// Method to verify/update status dynamically based on current date vs expiryDate
memberSchema.methods.updateStatusBasedOnExpiry = function () {
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    this.status = 'expired';
  } else if (this.membershipPlan && this.status === 'expired') {
    this.status = 'active';
  }
  return this.status;
};

module.exports = mongoose.model('Member', memberSchema);
