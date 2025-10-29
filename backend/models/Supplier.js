import mongoose from "mongoose";

/**
 * Supplier Model
 * ----------------
 * Represents a material supplier or vendor.
 *
 * Fields:
 * - name: Supplier company name
 * - contact: Contact person name
 * - phone: Contact number
 * - email: Email address
 * - address: Physical or billing address
 * - materials: Virtual field (linked materials)
 */

const SupplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      unique: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Allow empty or 10–15 digits, optional '+' prefix
          return !v || /^\+?\d{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          // Basic email validation
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    rating: {
      type: Number,
      default: 5,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * 🔗 Virtual: materials
 * Automatically populate materials supplied by this supplier.
 * (Assumes Material model references supplier)
 */
SupplierSchema.virtual("materials", {
  ref: "Material",
  localField: "_id",
  foreignField: "supplier",
});

/**
 * 📞 Pre-save cleanup
 * Normalizes phone and name formats.
 */
SupplierSchema.pre("save", function (next) {
  if (this.name) this.name = this.name.trim();
  if (this.contact) this.contact = this.contact.trim();
  if (this.phone) this.phone = this.phone.replace(/\s+/g, "");
  next();
});

/**
 * 🧠 Instance method: isActiveSupplier
 * Returns true if supplier is active and contact info is valid.
 */
SupplierSchema.methods.isActiveSupplier = function () {
  return this.active && (!!this.phone || !!this.email);
};

/**
 * 📊 Static method: findTopSuppliers
 * Finds suppliers sorted by rating (desc).
 */
SupplierSchema.statics.findTopSuppliers = function (limit = 5) {
  return this.find({ active: true }).sort({ rating: -1 }).limit(limit);
};

const Supplier = mongoose.model("Supplier", SupplierSchema);
export default Supplier;