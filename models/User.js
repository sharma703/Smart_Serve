const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: function () {
        // Password is required if there's no googleId
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      sparse: true, // Allows null/undefined to not conflict with unique index if added
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
