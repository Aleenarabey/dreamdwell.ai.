import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["present", "absent", "half_day", "leave"],
      default: "absent"
    },
    checkIn: {
      type: Date
    },
    checkOut: {
      type: Date
    },
    workHours: {
      type: Number,
      default: 0
    },
    notes: {
      type: String
    },
    markedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one attendance record per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Method to calculate work hours
AttendanceSchema.methods.calculateWorkHours = function() {
  if (this.checkIn && this.checkOut) {
    const diff = this.checkOut - this.checkIn;
    this.workHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
  }
  return this.workHours;
};

export default mongoose.model("Attendance", AttendanceSchema);

