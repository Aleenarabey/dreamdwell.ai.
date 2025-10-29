import mongoose from "mongoose";

/**
 * Expense Model
 * ----------------
 * Tracks all types of expenses: materials, labor, suppliers, etc.
 */
const ExpenseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["material", "labor", "supplier", "other"],
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    unit: {
      type: String,
      trim: true,
    },
    unitPrice: {
      type: Number,
      min: 0,
    },
    // References for linking
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial"],
      default: "pending",
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate amount if quantity and unitPrice provided
ExpenseSchema.pre("save", function (next) {
  if (this.quantity && this.unitPrice && !this.amount) {
    this.amount = this.quantity * this.unitPrice;
  }
  
  // Update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = "pending";
  } else if (this.paidAmount >= this.amount) {
    this.paymentStatus = "paid";
  } else {
    this.paymentStatus = "partial";
  }
  
  next();
});

const Expense = mongoose.model("Expense", ExpenseSchema);
export default Expense;

