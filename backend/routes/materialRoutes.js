import express from 'express';
import Material from '../models/Material.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ➕ Create Material (Admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    // Handle empty supplier string - convert to null for optional field
    const materialData = { ...req.body };
    if (materialData.supplier === '') {
      materialData.supplier = null;
    }
    
    const material = await Material.create(materialData);
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📋 Get All Materials
router.get('/', async (req, res) => {
  try {
    const materials = await Material.find().populate('supplier');
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⚠️ Get Low Stock Materials
router.get('/low-stock/check', async (req, res) => {
  try {
    const lowStock = await Material.findLowStock().populate('supplier');
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚨 Get Low Stock Alerts Summary
router.get('/low-stock/alerts', async (req, res) => {
  try {
    const lowStockMaterials = await Material.findLowStock().populate('supplier');
    
    const alerts = lowStockMaterials.map(material => ({
      id: material._id,
      name: material.name,
      stock: material.stock,
      reorderLevel: material.reorderLevel,
      unit: material.unit,
      supplier: material.supplier ? {
        name: material.supplier.name,
        contact: material.supplier.contact
      } : null,
      urgency: material.stock === 0 ? 'critical' : 
               material.stock <= material.reorderLevel * 0.5 ? 'high' : 'medium',
      message: material.stock === 0 ? 
        `${material.name} is out of stock` :
        `${material.name} stock is low (${material.stock} ${material.unit} remaining, reorder level: ${material.reorderLevel} ${material.unit})`
    }));

    res.json({
      count: alerts.length,
      alerts: alerts,
      criticalCount: alerts.filter(a => a.urgency === 'critical').length,
      highCount: alerts.filter(a => a.urgency === 'high').length,
      mediumCount: alerts.filter(a => a.urgency === 'medium').length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💰 Get Total Inventory Value (All Materials)
router.get('/inventory/total-value', async (req, res) => {
  try {
    const materials = await Material.find();
    const totalValue = materials.reduce((sum, material) => {
      return sum + (material.unitPrice * material.stock);
    }, 0);
    res.json({ totalValue, itemCount: materials.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get One Material
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('supplier');
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Material (Admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    // Handle empty supplier string - convert to null for optional field
    const updateData = { ...req.body };
    if (updateData.supplier === '') {
      updateData.supplier = null;
    }
    
    const updated = await Material.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Material not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Material (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Material.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💰 Get Inventory Value for a Material
router.get('/:id/value', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json({ totalValue: material.totalValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
