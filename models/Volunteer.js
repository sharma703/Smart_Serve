const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    skill: {
      type: String,
      required: true,
    },
    additionalSkills: {
      type: [String],
      default: [],
    },
    age: {
      type: Number,
      default: null,
    },
    experience: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: '',
    },
    availability: {
      type: mongoose.Schema.Types.Mixed,
      default: { days: [], timeSlot: 'Anytime' },
    },
    hoursPerWeek: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    emergency: {
      type: Boolean,
      default: false,
    },
    available: {
      type: Boolean,
      default: true,
    },
    assignmentCount: {
      type: Number,
      default: 0,
    },
    lastAssignedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Include virtual `id` mapping
volunteerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
