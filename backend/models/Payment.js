import mongoose from "mongoose";

/**
 * Payment Model
 * ----------------
 * Tracks client payments for projects
 */
const PaymentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "partially_paid", "paid", "overdue"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "cheque", "online", "other"],
      default: "bank_transfer",
    },
    invoiceNumber: {
      type: String,
      trim: true,
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

// Auto-calculate due amount
PaymentSchema.pre("save", function (next) {
  this.dueAmount = this.amount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount === 0) {
    this.status = "pending";
  } else if (this.paidAmount >= this.amount) {
    this.status = "paid";
    this.dueAmount = 0;
  } else {
    this.status = "partially_paid";
  }
  
  // Check if overdue
  if (this.dueDate && this.dueAmount > 0 && new Date() > this.dueDate) {
    this.status = "overdue";
  }
  
  next();
});

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;

