const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sets: {
      type: Number,
      default: 3,
      min: 1,
    },
    reps: {
      type: Number,
      default: 12,
      min: 1,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    restSeconds: {
      type: Number,
      default: 60,
    },
    instructions: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide workout plan name'],
      trim: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      default: null,
    },
    goal: {
      type: String,
      default: 'General Fitness',
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    exercises: [workoutExerciseSchema],
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
