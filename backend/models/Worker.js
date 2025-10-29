import mongoose from "mongoose";

/**
 * Worker Model
 * ---------------- 
 * Represents an individual construction worker/employee
 */

const WorkerSchema = new mongoose.Schema(
  {
    workerId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Worker name is required"],
      trim: true,
    },
    photo: {
      type: String, // URL or file path
      default: null,
    },
    contact: {
      phone: {
        type: String,
        required: [true, "Contact number is required"],
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    skillType: {
      type: String,
      required: [true, "Skill type is required"],
      enum: [
        "Mason",
        "Electrician",
        "Plumber",
        "Welder",
        "Carpenter",
        "Painter",
        "Laborer",
        "Supervisor",
        "Engineer",
        "Architect",
        "Other",
      ],
    },
    skills: [{
      type: String,
    }],
    experience: {
      years: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    documents: {
      idProof: {
        file: String, // File path or URL
        type: String, // Aadhaar, PAN, Passport, etc.
        number: String,
        expiryDate: Date,
        status: {
          type: String,
          enum: ["valid", "expiring", "expired", "pending"],
          default: "pending",
        },
      },
      skillCert: {
        file: String,
        expiryDate: Date,
        status: {
          type: String,
          enum: ["valid", "expiring", "expired", "pending"],
          default: "pending",
        },
      },
      medical: {
        file: String,
        expiryDate: Date,
        status: {
          type: String,
          enum: ["valid", "expiring", "expired", "pending"],
          default: "pending",
        },
      },
      background: {
        file: String,
        expiryDate: Date,
        status: {
          type: String,
          enum: ["verified", "pending", "failed"],
          default: "pending",
        },
      },
    },
    assignedProject: {
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
      },
      projectName: String,
      site: String,
      assignedDate: Date,
    },
    wages: {
      dailyWage: {
        type: Number,
        default: 0,
      },
      hourlyRate: {
        type: Number,
        default: 0,
      },
      contractType: {
        type: String,
        enum: ["Permanent", "Contract", "Subcontract"],
        default: "Contract",
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },
    attendance: {
      todayStatus: {
        type: String,
        enum: ["Present", "Absent", "On Leave", "Half Day"],
        default: "Absent",
      },
      lastAttendanceDate: Date,
    },
    totalDaysWorked: {
      type: Number,
      default: 0,
    },
    totalHoursWorked: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate Worker ID before saving
WorkerSchema.pre("save", async function (next) {
  if (!this.workerId) {
    const count = await mongoose.model("Worker").countDocuments();
    this.workerId = `WRK${String(count + 1).padStart(5, "0")}`;
  }
  
  // Update document status based on expiry dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check ID Proof
  if (this.documents.idProof?.expiryDate) {
    const daysUntilExpiry = Math.ceil(
      (this.documents.idProof.expiryDate - today) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry < 0) {
      this.documents.idProof.status = "expired";
    } else if (daysUntilExpiry <= 30) {
      this.documents.idProof.status = "expiring";
    } else {
      this.documents.idProof.status = "valid";
    }
  }
  
  // Check Skill Certificate
  if (this.documents.skillCert?.expiryDate) {
    const daysUntilExpiry = Math.ceil(
      (this.documents.skillCert.expiryDate - today) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry < 0) {
      this.documents.skillCert.status = "expired";
    } else if (daysUntilExpiry <= 30) {
      this.documents.skillCert.status = "expiring";
    } else {
      this.documents.skillCert.status = "valid";
    }
  }
  
  // Check Medical
  if (this.documents.medical?.expiryDate) {
    const daysUntilExpiry = Math.ceil(
      (this.documents.medical.expiryDate - today) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry < 0) {
      this.documents.medical.status = "expired";
    } else if (daysUntilExpiry <= 30) {
      this.documents.medical.status = "expiring";
    } else {
      this.documents.medical.status = "valid";
    }
  }
  
  next();
});

// Virtual: Calculate total earnings based on days worked and daily wage
WorkerSchema.virtual("totalEarnings").get(function () {
  return this.totalDaysWorked * (this.wages.dailyWage || 0);
});

const Worker = mongoose.model("Worker", WorkerSchema);
export default Worker;
