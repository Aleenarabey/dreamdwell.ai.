// floorplan.model.js
import mongoose from "mongoose";

const WallSchema = new mongoose.Schema({
  type: { type: String, enum: ["horizontal", "vertical"], required: true },
  start: Number,
  end: Number,
  x: Number,   // used if vertical
  y: Number    // used if horizontal
});

const FloorplanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  walls: [WallSchema],
  rooms: [
    {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  ],
  measurements: [
    {
      text: String,
      x: Number,
      y: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Floorplan", FloorplanSchema);

