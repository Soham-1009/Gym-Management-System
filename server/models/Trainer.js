const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide trainer specialization'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: [0, 'Experience cannot be negative'],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    availability: {
      type: String,
      enum: ['morning', 'evening', 'full-time'],
      default: 'full-time',
    },
    assignedMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
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

module.exports = mongoose.model('Trainer', trainerSchema);
