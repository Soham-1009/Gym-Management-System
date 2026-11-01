const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide exercise name'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ['strength', 'cardio', 'flexibility', 'core'],
      default: 'strength',
    },
    targetMuscle: {
      type: String,
      trim: true,
      default: 'Full Body',
    },
    equipment: {
      type: String,
      trim: true,
      default: 'Bodyweight',
    },
    description: {
      type: String,
      default: '',
    },
    instructions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
