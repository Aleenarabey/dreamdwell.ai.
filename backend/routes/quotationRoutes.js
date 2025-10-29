import express from "express";
import Quotation from "../models/Quotation.js";
import Project from "../models/Project.js";

const router = express.Router();

/**
 * @route   POST /api/quotations
 * @desc    Create quotation manually
 */
router.post("/", async (req, res) => {
  try {
    const quote = await Quotation.create(req.body);
    res.status(201).json(quote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   GET /api/quotations
 * @desc    Get all quotations
 */
router.get("/", async (req, res) => {
  try {
    const list = await Quotation.find().populate("project");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/quotations/:id
 * @desc    Get a specific quotation
 */
router.get("/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate("project");
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/quotations/generate/:projectId
 * @desc    Auto-generate quotation items from projectId
 */
router.post("/generate/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("materials.material")
      .populate("labors.labor");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Prepare quotation items from materials
    const materialItems = project.materials.map((m) => ({
      description: m.material.name,
      quantity: m.quantity,
      unitCost: m.material.unitCost,
      totalCost: m.quantity * m.material.unitCost,
    }));

    // Prepare quotation items from labors
    const laborItems = project.labors.map((l) => ({
      description: l.labor.role,
      quantity: l.days,
      unitCost: l.labor.dailyRate,
      totalCost: l.days * l.labor.dailyRate,
    }));

    // Combine
    const items = [...materialItems, ...laborItems];

    // Compute totals
    const materialCost = materialItems.reduce((sum, i) => sum + i.totalCost, 0);
    const laborCost = laborItems.reduce((sum, i) => sum + i.totalCost, 0);
    const subtotal = materialCost + laborCost;

    const profitMargin = req.body.profitMargin ?? 0.1; // default 10%
    const tax = req.body.tax ?? 0.18; // default 18%

    const totalWithProfit = subtotal * (1 + profitMargin);
    const totalWithTax = totalWithProfit * (1 + tax);

    // Create and save quotation
    const quotation = await Quotation.create({
      project: project._id,
      clientName: project.clientName || "Unknown Client",
      items,
      materialCost,
      laborCost,
      profitMargin,
      tax,
      totalAmount: totalWithTax,
    });

    res.status(201).json({
      message: "Quotation generated successfully",
      quotation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/quotations/:id
 * @desc    Update quotation
 */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Quotation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Quotation not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/quotations/:id
 * @desc    Delete quotation
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Quotation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Quotation not found" });
    res.json({ message: "Quotation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;