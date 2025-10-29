import express from "express";
import Labour from "../models/Labour.js";

const router = express.Router();

// ➕ Create Labour Role
router.post("/", async (req, res) => {
  try {
    const labor = await Labour.create(req.body);
    res.status(201).json(labor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📋 Get All Labour Roles
router.get("/", async (req, res) => {
  try {
    const allLabour = await Labour.find().sort({ role: 1 });
    res.json(allLabour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get One Labour Role
router.get("/:id", async (req, res) => {
  try {
    const labor = await Labour.findById(req.params.id);
    if (!labor) return res.status(404).json({ message: "Labour not found" });
    res.json(labor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Labour Role
router.put("/:id", async (req, res) => {
  try {
    const updated = await Labour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Labour Role
router.delete("/:id", async (req, res) => {
  try {
    await Labour.findByIdAndDelete(req.params.id);
    res.json({ message: "Labour role deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get All Available Labour Roles
router.get("/availability/active", async (req, res) => {
  try {
    const available = await Labour.find({ availability: true }).sort({ role: 1 });
    res.json(available);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💰 Estimate Labour Cost for Given Days
router.get("/:id/estimate/:days", async (req, res) => {
  try {
    const labor = await Labour.findById(req.params.id);
    if (!labor) return res.status(404).json({ message: "Labour not found" });

    const totalCost = labor.calculateTotalCost(parseInt(req.params.days));
    res.json({ role: labor.role, totalCost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
