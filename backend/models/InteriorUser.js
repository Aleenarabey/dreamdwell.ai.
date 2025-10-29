import mongoose from "mongoose";

const InteriorUserSchema = new mongoose.Schema(
  {
    designerName: { type: String, trim: true, default: "Admin" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      minlength: 6,
      required: function () {
        return !this.googleId; // Password only required if not a Google user
      },
    },
    licenseId: { type: String, unique: true, sparse: true, trim: true },
    role: { type: String, enum: ["interiorDesigner", "admin"], default: "interiorDesigner" },
    userType: { type: String }, // Store original userType for reference
    googleId: { type: String, unique: true, sparse: true },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("InteriorUser", InteriorUserSchema);
