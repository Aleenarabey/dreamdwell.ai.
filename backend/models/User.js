import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String }, // Now optional for Google users
    role:      { type: String, default: "homeowner" },
    place:     { type: String, default: "" },
    state:     { type: String, default: "" },
    profilePhoto: { type: String, default: "" }, // Public URL like /uploads/filename.jpg
  },
  { timestamps: true }
);

// ✅ Named export for ES Modules
const User = mongoose.model("User", userSchema);
export default User;
