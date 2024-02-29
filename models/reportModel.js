const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  signInTime: {
    type: Date
  },
  signOutTime: {
    type: Date
  },
  absent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
