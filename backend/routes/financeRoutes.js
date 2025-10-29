import express from "express";
import Project from "../models/Project.js";
import Material from "../models/Material.js";
import Worker from "../models/Worker.js";
import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import Supplier from "../models/Supplier.js";

const router = express.Router();

// Get Finance Overview (Summary Cards)
router.get("/overview", async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Calculate Total Budget Allocated
    const totalBudget = await Project.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$budget", 0] } } } },
    ]);

    // Calculate Material Expenses
    const materialExpenses = await Expense.aggregate([
      { 
        $match: { 
          type: "material",
          ...dateFilter,
          ...(projectId ? { projectId: projectId } : {})
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate Labor Wages Paid
    const laborExpenses = await Expense.aggregate([
      { 
        $match: { 
          type: "labor",
          ...dateFilter,
          ...(projectId ? { projectId: projectId } : {})
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate Supplier Payments
    const supplierExpenses = await Expense.aggregate([
      { 
        $match: { 
          type: "supplier",
          ...dateFilter,
          ...(projectId ? { projectId: projectId } : {})
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate Total Expenses
    const totalExpenses = await Expense.aggregate([
      { 
        $match: {
          ...dateFilter,
          ...(projectId ? { projectId: projectId } : {})
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate Total Client Payments Received
    const clientPayments = await Payment.aggregate([
      { 
        $match: {
          ...(startDate || endDate ? {
            paymentDate: {
              ...(startDate ? { $gte: new Date(startDate) } : {}),
              ...(endDate ? { $lte: new Date(endDate) } : {}),
            }
          } : {}),
          ...(projectId ? { projectId: projectId } : {})
        }
      },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    // Calculate Pending Payments
    const pendingPayments = await Payment.aggregate([
      { 
        $match: {
          status: { $in: ["pending", "partially_paid", "overdue"] },
          ...(projectId ? { projectId: projectId } : {})
        }
      },
      { $group: { _id: null, total: { $sum: "$dueAmount" } } },
    ]);

    // Calculate Net Profit/Loss
    const totalClientPayments = clientPayments[0]?.total || 0;
    const totalExpensesAmount = totalExpenses[0]?.total || 0;
    const netProfit = totalClientPayments - totalExpensesAmount;

    res.json({
      totalBudget: totalBudget[0]?.total || 0,
      materialExpenses: materialExpenses[0]?.total || 0,
      laborExpenses: laborExpenses[0]?.total || 0,
      supplierExpenses: supplierExpenses[0]?.total || 0,
      totalExpenses: totalExpensesAmount,
      clientPayments: totalClientPayments,
      pendingPayments: pendingPayments[0]?.total || 0,
      netProfit: netProfit,
    });
  } catch (err) {
    console.error("Error fetching finance overview:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Project-wise Financial Breakdown
router.get("/projects-breakdown", async (req, res) => {
  try {
    const projects = await Project.find({}).lean();

    const breakdown = await Promise.all(
      projects.map(async (project) => {
        // Calculate spent amount from expenses
        const expenses = await Expense.aggregate([
          { $match: { projectId: project._id } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const spent = expenses[0]?.total || 0;
        const budget = project.budget || 0;
        const remaining = budget - spent;

        // Get client payments
        const payments = await Payment.find({ projectId: project._id }).lean();
        const totalPaid = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
        const totalDue = payments.reduce((sum, p) => sum + (p.dueAmount || 0), 0);

        return {
          projectId: project._id,
          projectName: project.name,
          clientName: project.clientName || "N/A",
          budget: budget,
          spent: spent,
          remaining: remaining,
          clientPaid: totalPaid,
          clientDue: totalDue,
          status: project.status,
          isOverBudget: remaining < 0,
        };
      })
    );

    res.json(breakdown);
  } catch (err) {
    console.error("Error fetching projects breakdown:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Material Cost Management
router.get("/materials", async (req, res) => {
  try {
    const { startDate, endDate, supplierId } = req.query;

    const matchFilter = { type: "material" };
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) matchFilter.date.$gte = new Date(startDate);
      if (endDate) matchFilter.date.$lte = new Date(endDate);
    }
    if (supplierId) matchFilter.supplierId = supplierId;

    const expenses = await Expense.find(matchFilter)
      .populate("materialId", "name unit")
      .populate("supplierId", "name")
      .populate("projectId", "name")
      .sort({ date: -1 })
      .lean();

    res.json(expenses);
  } catch (err) {
    console.error("Error fetching material costs:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Labor & Payroll Section
router.get("/payroll", async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;

    const matchFilter = { type: "labor" };
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) matchFilter.date.$gte = new Date(startDate);
      if (endDate) matchFilter.date.$lte = new Date(endDate);
    }
    if (projectId) matchFilter.projectId = projectId;

    const expenses = await Expense.find(matchFilter)
      .populate("workerId", "name workerId skillType")
      .populate("projectId", "name")
      .sort({ date: -1 })
      .lean();

    // Group by worker for summary
    const workerSummary = {};
    expenses.forEach((expense) => {
      const workerId = expense.workerId?._id?.toString() || "unknown";
      if (!workerSummary[workerId]) {
        workerSummary[workerId] = {
          worker: expense.workerId,
          totalDays: 0,
          wages: 0,
          overtime: 0,
          totalPaid: 0,
        };
      }
      workerSummary[workerId].wages += expense.amount || 0;
      workerSummary[workerId].totalPaid += expense.amount || 0;
      if (expense.quantity) workerSummary[workerId].totalDays += expense.quantity;
    });

    res.json({
      summary: Object.values(workerSummary),
      details: expenses,
    });
  } catch (err) {
    console.error("Error fetching payroll:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Client Payment Tracking
router.get("/client-payments", async (req, res) => {
  try {
    const { projectId, status } = req.query;

    const matchFilter = {};
    if (projectId) matchFilter.projectId = projectId;
    if (status) matchFilter.status = status;

    const payments = await Payment.find(matchFilter)
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json(payments);
  } catch (err) {
    console.error("Error fetching client payments:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update Client Payment
router.patch("/client-payments/:id", async (req, res) => {
  try {
    const { paidAmount, status, paymentDate, paymentMethod, notes } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (paidAmount !== undefined) {
      payment.paidAmount = paidAmount;
    }
    if (status) payment.status = status;
    if (paymentDate) payment.paymentDate = new Date(paymentDate);
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (notes !== undefined) payment.notes = notes;

    await payment.save();

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to("finance-room").emit("finance-update", {
        type: "payment-updated",
        payment: payment,
        timestamp: new Date(),
      });
    }

    res.json(payment);
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get Supplier Payments
router.get("/supplier-payments", async (req, res) => {
  try {
    const { supplierId, status } = req.query;

    const matchFilter = { type: "supplier" };
    if (supplierId) matchFilter.supplierId = supplierId;
    if (status) matchFilter.paymentStatus = status;

    const expenses = await Expense.find(matchFilter)
      .populate("supplierId", "name")
      .populate("projectId", "name")
      .sort({ date: -1 })
      .lean();

    res.json(expenses);
  } catch (err) {
    console.error("Error fetching supplier payments:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update Supplier Payment Status
router.patch("/supplier-payments/:id", async (req, res) => {
  try {
    const { paidAmount, paymentStatus } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (paidAmount !== undefined) expense.paidAmount = paidAmount;
    if (paymentStatus) expense.paymentStatus = paymentStatus;

    await expense.save();

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to("finance-room").emit("finance-update", {
        type: "expense-updated",
        expense: expense,
        timestamp: new Date(),
      });
    }

    res.json(expense);
  } catch (err) {
    console.error("Error updating supplier payment:", err);
    res.status(400).json({ error: err.message });
  }
});

// Create Payment (Client)
router.post("/payments", async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    const io = req.app.get("io");
    if (io) {
      io.to("finance-room").emit("finance-update", {
        type: "payment-created",
        payment: payment,
        timestamp: new Date(),
      });
    }

    res.status(201).json(payment);
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(400).json({ error: err.message });
  }
});

// Create Expense
router.post("/expenses", async (req, res) => {
  try {
    const expense = await Expense.create(req.body);

    const io = req.app.get("io");
    if (io) {
      io.to("finance-room").emit("finance-update", {
        type: "expense-created",
        expense: expense,
        timestamp: new Date(),
      });
    }

    res.status(201).json(expense);
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;

