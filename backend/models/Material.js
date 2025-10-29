import mongoose from "mongoose";

/**
 * Material Model
 * ----------------
 * Represents a construction material entry in the system.
 * Linked to Supplier model for tracking supply source.
 *
 * Fields:
 * - name: Material name (e.g., Cement, Sand)
 * - unit: Unit of measurement (e.g., bag, kg, m3)
 * - unitPrice: Price per unit
 * - co2PerUnit: Emission factor per unit (for eco calculator)
 * - supplier: Reference to Supplier document
 * - stock: Current available stock
 * - reorderLevel: Minimum stock level before triggering restock alert
 */

const MaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Material name is required"],
      trim: true,
      unique: true,
    },
    unit: {
      type: String,
      required: [true, "Unit type is required"],
      trim: true,
      enum: ["bag", "kg", "m3", "piece", "litre", "tonne", "unit", "sqft"],
      default: "unit",
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    co2PerUnit: {
      type: Number,
      default: 0,
      min: [0, "CO2 value cannot be negative"],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: false,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: [0, "Reorder level cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field: totalValue
 * Calculates current inventory value = unitPrice * stock
 */
MaterialSchema.virtual("totalValue").get(function () {
  return this.unitPrice * this.stock;
});

/**
 * Pre-save hook for sanitization and total value calculation
 */
MaterialSchema.pre("save", function (next) {
  if (this.name) this.name = this.name.trim();
  this.totalValue = this.unitPrice * this.stock;
  next();
});

/**
 * Static method: findLowStock
 * Returns all materials below their reorder level.
 */
MaterialSchema.statics.findLowStock = function () {
  return this.find({ $expr: { $lt: ["$stock", "$reorderLevel"] } });
};

/**
 * Instance method: needsRestock
 * Checks if material stock is below reorder level.
 */
MaterialSchema.methods.needsRestock = function () {
  return this.stock < this.reorderLevel;
};

const Material = mongoose.model("Material", MaterialSchema);
export default Material;