import mongoose from "mongoose";

/**
 * Labor Model
 * ----------------
 * Represents a labor role or worker type involved in construction.
 *
 * Fields:
 * - role: Worker type or specialization (e.g., Mason, Carpenter)
 * - hourlyRate: Cost per hour
 * - dailyHours: Default daily working hours
 * - experienceLevel: Optional classification of skill
 * - availability: Worker availability status
 * - efficiencyFactor: Used in cost/time estimation (0.0–1.5 range)
 */

const LaborSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "Labor role is required"],
      trim: true,
      unique: true,
    },
    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required"],
      min: [0, "Hourly rate cannot be negative"],
    },
    dailyHours: {
      type: Number,
      default: 8,
      min: [1, "Daily hours must be at least 1"],
      max: [24, "Daily hours cannot exceed 24"],
    },
    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "expert"],
      default: "mid",
    },
    availability: {
      type: Boolean,
      default: true,
    },
    efficiencyFactor: {
      type: Number,
      default: 1.0,
      min: [0.5, "Efficiency factor must be >= 0.5"],
      max: [1.5, "Efficiency factor must be <= 1.5"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * 💰 Virtual field: dailyRate
 * Automatically computes daily wage = hourlyRate * dailyHours
 */
LaborSchema.virtual("dailyRate").get(function () {
  return this.hourlyRate * this.dailyHours;
});

/**
 * ⚙️ Instance method: calculateTotalCost
 * Computes cost for given number of days (auto adjusts for efficiency)
 */
LaborSchema.methods.calculateTotalCost = function (days = 1) {
  const baseCost = this.dailyRate * days;
  return baseCost / this.efficiencyFactor; // lower efficiency = higher cost
};

/**
 * 🔍 Static method: findAvailable
 * Returns list of available labor roles
 */
LaborSchema.statics.findAvailable = function () {
  return this.find({ availability: true }).sort({ role: 1 });
};

/**
 * 🧠 Pre-save hook
 * Ensures role capitalization and valid efficiency factor
 */
LaborSchema.pre("save", function (next) {
  if (this.role) {
    this.role =
      this.role.charAt(0).toUpperCase() + this.role.slice(1).toLowerCase();
  }
  if (this.efficiencyFactor < 0.5) this.efficiencyFactor = 0.5;
  if (this.efficiencyFactor > 1.5) this.efficiencyFactor = 1.5;
  next();
});

const Labor = mongoose.model("Labor", LaborSchema);
export default Labor;
