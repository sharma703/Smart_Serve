const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    areaName: {
      type: String,
      required: true,
      trim: true,
    },
    problemType: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    population: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    urgent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'Urgent', 'Assigned', 'Completed'],
      default: 'Pending',
    },
    volunteerId: {
      type: String, // String to support uuid and mongoose ObjectId if needed, or keeping it compatible
      default: null,
    },
    volunteerName: {
      type: String,
      default: null,
    },
    volunteerSkill: {
      type: String,
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // This handles createdAt (timestamp) and updatedAt
  }
);

// We need a virtual `id` to map `_id` so the frontend doesn't break
reportSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Report', reportSchema);
