const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    weightKg: {
      type: Number,
      required: [true, 'Please provide weight in kg'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [300, 'Weight cannot exceed 300 kg'],
    },
    heightCm: {
      type: Number,
      required: [true, 'Please provide height in cm'],
      min: [50, 'Height must be at least 50 cm'],
      max: [250, 'Height cannot exceed 250 cm'],
    },
    bmi: {
      type: Number,
    },
    measurements: {
      chestCm: { type: Number, default: 0 },
      waistCm: { type: Number, default: 0 },
      hipsCm: { type: Number, default: 0 },
      armsCm: { type: Number, default: 0 },
      thighsCm: { type: Number, default: 0 },
    },
    notes: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate BMI prior to saving
progressSchema.pre('save', function (next) {
  if (this.weightKg && this.heightCm) {
    const heightInMeters = this.heightCm / 100;
    this.bmi = parseFloat((this.weightKg / (heightInMeters * heightInMeters)).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('Progress', progressSchema);
