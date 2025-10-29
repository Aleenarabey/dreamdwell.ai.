import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    engineer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workDone: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
