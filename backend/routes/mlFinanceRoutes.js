import express from "express";
import axios from "axios";
import Project from "../models/Project.js";
import Expense from "../models/Expense.js";
import Payment from "../models/Payment.js";
import Material from "../models/Material.js";
import Worker from "../models/Worker.js";
import Supplier from "../models/Supplier.js";

const router = express.Router();

// ML Service URL - can be set via environment variable
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

// Debug middleware - log all requests to ml-finance routes
router.use((req, res, next) => {
  console.log(`[ML Finance Routes] ${req.method} ${req.path}`, {
    query: req.query,
    params: req.params,
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

/**
 * Ensure the specified model type is trained in the ML service.
 * If the service reports zero models, this will train a small baseline model
 * so that predictions work out-of-the-box.
 */
async function ensureModelTrained(modelType = "budget_overrun") {
  try {
    // Check health
    const health = await axios.get(`${ML_SERVICE_URL}/health`).then(r => r.data).catch(() => null);
    if (!health) return; // ML service unreachable; let caller handle error

    // If at least one model already loaded, skip
    if (typeof health.models_loaded === "number" && health.models_loaded > 0) return;

    // Prepare tiny baseline training data for budget_overrun
    if (modelType === "budget_overrun") {
      const data = [
        { project_budget: 100000, current_spent: 60000, progress_percentage: 55, days_elapsed: 45, project_duration: 90, final_cost: 110000 },
        { project_budget: 200000, current_spent: 120000, progress_percentage: 60, days_elapsed: 60, project_duration: 120, final_cost: 210000 },
        { project_budget: 150000, current_spent: 90000, progress_percentage: 65, days_elapsed: 50, project_duration: 100, final_cost: 160000 },
        { project_budget: 180000, current_spent: 100000, progress_percentage: 50, days_elapsed: 45, project_duration: 120, final_cost: 190000 },
        { project_budget: 220000, current_spent: 110000, progress_percentage: 48, days_elapsed: 40, project_duration: 130, final_cost: 235000 },
      ];
      await axios.post(`${ML_SERVICE_URL}/train`, { model_type: "budget_overrun", data });
    }
  } catch (e) {
    // Non-fatal; prediction route can still proceed and surface error
    console.warn("ensureModelTrained warning:", e?.message || e);
  }
}

/**
 * Prepare project data for budget overrun prediction
 */
async function prepareBudgetOverrunData(projectId) {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Calculate current spending
    const expenses = await Expense.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const currentSpent = expenses[0]?.total || 0;

    // Calculate days elapsed and duration
    const startDate = project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
    const endDate = project.endDate ? new Date(project.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 90 days
    const now = new Date();
    const daysElapsed = Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
    const projectDuration = Math.max(1, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)));

    return {
      project_budget: project.budget || 0,
      current_spent: currentSpent,
      progress_percentage: project.progressPercentage || 0,
      days_elapsed: daysElapsed,
      project_duration: projectDuration,
    };
  } catch (error) {
    console.error("Error preparing budget overrun data:", error);
    throw error;
  }
}

/**
 * Prepare cash flow data for prediction
 * Can optionally filter by projectId
 */
async function prepareCashFlowData(startDate, endDate, projectId = null) {
  try {
    // Build match filter for payments
    const paymentMatch = {
      paymentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
    if (projectId) {
      paymentMatch.projectId = projectId;
    }

    // Calculate historical cash flow (client payments - expenses)
    const payments = await Payment.aggregate([
      { $match: paymentMatch },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    // Build match filter for expenses
    const expenseMatch = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
    if (projectId) {
      expenseMatch.projectId = projectId;
    }

    const expenses = await Expense.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const revenue = payments[0]?.total || 0;
    const expensesTotal = expenses[0]?.total || 0;
    const historicalCashFlow = revenue - expensesTotal;

    // Get pending payments (optionally filtered by project)
    const pendingPaymentMatch = {
      status: { $in: ["pending", "partially_paid", "overdue"] },
    };
    if (projectId) {
      pendingPaymentMatch.projectId = projectId;
    }

    const pendingPayments = await Payment.aggregate([
      { $match: pendingPaymentMatch },
      { $group: { _id: null, total: { $sum: "$dueAmount" } } },
    ]);

    // Get pending expenses (optionally filtered by project)
    const pendingExpenseMatch = {
      paymentStatus: { $in: ["pending", "partial"] },
    };
    if (projectId) {
      pendingExpenseMatch.projectId = projectId;
    }

    const pendingExpenses = await Expense.aggregate([
      { $match: pendingExpenseMatch },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: ["$amount", { $ifNull: ["$paidAmount", 0] }] } },
        },
      },
    ]);

    const month = new Date().getMonth() + 1;

    // Get project info if projectId is provided
    let projectInfo = null;
    if (projectId) {
      const project = await Project.findById(projectId).select('name clientName');
      if (project) {
        projectInfo = {
          projectId: project._id.toString(),
          projectName: project.name,
          clientName: project.clientName
        };
      }
    }

    return {
      historical_cash_flow: historicalCashFlow,
      pending_payments: pendingPayments[0]?.total || 0,
      pending_expenses: pendingExpenses[0]?.total || 0,
      month: month,
      revenue: revenue,
      expenses: expensesTotal,
      project: projectInfo, // Include project info if available
    };
  } catch (error) {
    console.error("Error preparing cash flow data:", error);
    throw error;
  }
}

/**
 * Prepare project cost prediction data
 */
async function prepareProjectCostData(projectId) {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Get material costs
    const materialExpenses = await Expense.aggregate([
      {
        $match: {
          projectId: project._id,
          type: "material",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get labor costs
    const laborExpenses = await Expense.aggregate([
      {
        $match: {
          projectId: project._id,
          type: "labor",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const startDate = project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
    const endDate = project.endDate ? new Date(project.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    const duration = Math.max(1, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)));

    // Estimate project size (can be improved with actual data)
    const projectSize = project.materialsRequired?.length || 1;

    return {
      budget: project.budget || 0,
      material_costs: materialExpenses[0]?.total || 0,
      labor_costs: laborExpenses[0]?.total || 0,
      project_size: projectSize,
      duration: duration,
      complexity_score: project.milestones?.length || 1,
    };
  } catch (error) {
    console.error("Error preparing project cost data:", error);
    throw error;
  }
}

// Helper to build predict URL with model_type parameter
function buildPredictUrl(endpoint, modelType = 'knn') {
  // modelType can be: 'knn', 'decision_tree', or 'naive_bayes'
  return `${ML_SERVICE_URL}${endpoint}?model_type=${modelType}`;
}

// Predict Budget Overrun for a Project
router.post("/predict/budget-overrun/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { model_type } = req.query; // 'knn', 'decision_tree', or 'naive_bayes'
    const modelType = model_type || 'knn'; // Default to KNN
    
    console.log("📊 Budget overrun prediction request received:", {
      projectId,
      model_type: modelType,
      url: req.url,
      method: req.method
    });
    
    const features = await prepareBudgetOverrunData(projectId);

    // Try to ensure a model is available (no-op if already trained)
    await ensureModelTrained("budget_overrun");

    const response = await axios.post(
      buildPredictUrl("/predict/budget-overrun", modelType),
      features
    );
    res.json({
      success: true,
      features,
      ...response.data,
    });
  } catch (error) {
    console.error("Error predicting budget overrun:", error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.detail || error.message,
    });
  }
});

// Predict Cash Flow
router.post("/predict/cash-flow", async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.body;
    const { model_type } = req.query; // 'knn', 'decision_tree', or 'naive_bayes'
    const modelType = model_type || 'knn'; // Default to KNN
    
    const defaultEndDate = endDate || new Date().toISOString();
    const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const features = await prepareCashFlowData(defaultStartDate, defaultEndDate, projectId);

    const response = await axios.post(
      buildPredictUrl("/predict/cash-flow", modelType),
      features
    );
    
    // Include project info in response if available
    const result = response.data;
    if (features.project) {
      result.project = features.project;
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error predicting cash flow:", error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.detail || error.message,
    });
  }
});

// Predict Project Cost
router.post("/predict/project-cost/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { use_knn } = req.query;
    const features = await prepareProjectCostData(projectId);

    const response = await axios.post(
      buildPredictUrl("/predict/project-cost", use_knn === 'true' || use_knn === true),
      features
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error predicting project cost:", error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.detail || error.message,
    });
  }
});

// Predict Material Cost
router.post("/predict/material-cost", async (req, res) => {
  try {
    const { materialId, quantity, month } = req.body;
    const { use_knn } = req.query;

    if (!materialId || !quantity) {
      return res.status(400).json({
        success: false,
        error: "materialId and quantity are required",
      });
    }

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: "Material not found",
      });
    }

    const features = {
      quantity: quantity,
      historical_price: material.unitPrice || 0,
      supplier_id_encoded: material.supplier ? 1 : 0, // Simple encoding, can be improved
      month: month || new Date().getMonth() + 1,
      material_type_encoded: 1, // Can be improved with actual encoding
    };

    const response = await axios.post(
      buildPredictUrl("/predict/material-cost", use_knn === 'true' || use_knn === true),
      features
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error predicting material cost:", error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.detail || error.message,
    });
  }
});

// Train Model with Historical Data
router.post("/train/:modelType", async (req, res) => {
  try {
    const { modelType } = req.params;
    const { model_subtype } = req.body; // 'linear' or 'knn'
    const validTypes = ["budget_overrun", "cash_flow", "project_cost", "material_cost"];

    if (!validTypes.includes(modelType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid model type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    let trainingData = [];

    if (modelType === "budget_overrun") {
      // Fetch historical project data
      const projects = await Project.find({ status: "completed" }).limit(50);
      for (const project of projects) {
        const expenses = await Expense.aggregate([
          { $match: { projectId: project._id } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const finalCost = expenses[0]?.total || project.budget || 0;

        const startDate = project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
        const endDate = project.endDate ? new Date(project.endDate) : new Date();
        const daysElapsed = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
        const duration = Math.max(1, daysElapsed);

        trainingData.push({
          project_budget: project.budget || 0,
          current_spent: finalCost * 0.8, // Simulate 80% progress
          progress_percentage: 80,
          days_elapsed: Math.floor(daysElapsed * 0.8),
          project_duration: duration,
          final_cost: finalCost,
        });
      }
    } else if (modelType === "cash_flow") {
      // Fetch historical monthly cash flow data
      const payments = await Payment.find({}).sort({ paymentDate: 1 }).limit(100);
      const expenses = await Expense.find({}).sort({ date: 1 }).limit(100);

      // Group by month (simplified)
      for (let i = 0; i < Math.min(payments.length, expenses.length); i++) {
        const month = (i % 12) + 1;
        trainingData.push({
          historical_cash_flow: payments[i].paidAmount - expenses[i].amount,
          pending_payments: 0,
          pending_expenses: 0,
          month: month,
          revenue: payments[i].paidAmount || 0,
          expenses: expenses[i].amount || 0,
          next_cash_flow: (payments[i + 1]?.paidAmount || 0) - (expenses[i + 1]?.amount || 0),
        });
      }
    } else if (modelType === "project_cost") {
      const projects = await Project.find({ status: "completed" }).limit(50);
      for (const project of projects) {
        const materialExpenses = await Expense.aggregate([
          { $match: { projectId: project._id, type: "material" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const laborExpenses = await Expense.aggregate([
          { $match: { projectId: project._id, type: "labor" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const startDate = project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
        const endDate = project.endDate ? new Date(project.endDate) : new Date();
        const duration = Math.max(1, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)));

        trainingData.push({
          budget: project.budget || 0,
          material_costs: materialExpenses[0]?.total || 0,
          labor_costs: laborExpenses[0]?.total || 0,
          project_size: project.materialsRequired?.length || 1,
          duration: duration,
          complexity_score: project.milestones?.length || 1,
          total_cost: (materialExpenses[0]?.total || 0) + (laborExpenses[0]?.total || 0),
        });
      }
    } else if (modelType === "material_cost") {
      const materials = await Material.find({}).limit(100);
      for (const material of materials) {
        trainingData.push({
          quantity: 1,
          historical_price: material.unitPrice || 0,
          supplier_id_encoded: material.supplier ? 1 : 0,
          month: new Date().getMonth() + 1,
          material_type_encoded: 1,
          predicted_price: material.unitPrice || 0,
        });
      }
    }

    if (trainingData.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Insufficient training data. Need at least 5 samples.",
      });
    }

    const response = await axios.post(`${ML_SERVICE_URL}/train`, {
      model_type: modelType,
      data: trainingData,
      model_subtype: model_subtype || 'linear',
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error training model:", error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.detail || error.message,
    });
  }
});

/**
 * Train supplier risk decision tree model
 * Supply: [{ supplierId, risk_level }]
 */
router.post("/ml/train/supplier-risk", async (req, res) => {
  try {
    const suppliersRequest = req.body.suppliers; // Array: [{ supplierId, risk_level }]
    if (!Array.isArray(suppliersRequest) || suppliersRequest.length < 5) {
      return res.status(400).json({ success: false, error: "At least 5 suppliers required for training" });
    }
    const supplierIds = suppliersRequest.map(s => s.supplierId);
    const dbSuppliers = await Supplier.find({ _id: { $in: supplierIds } });
    // Map and join up with provided labels
    const supplierData = dbSuppliers.map(sup => {
      const supplied = suppliersRequest.find(x => x.supplierId == sup._id.toString());
      return {
        rating: sup.rating,
        active: sup.active ? 1 : 0, // Convert Boolean to numeric
        risk_level: supplied?.risk_level || 'Unknown',
        // Add more supplier features here if needed in the future
      };
    });
    const response = await axios.post(`${ML_SERVICE_URL}/train/supplier-risk`, { data: supplierData });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.detail || error.message });
  }
});

/**
 * Predict supplier risk level given features or supplierId
 */
router.post("/ml/predict/supplier-risk", async (req, res) => {
  try {
    let features = req.body.features;
    if (req.body.supplierId && !features) {
      const sup = await Supplier.findById(req.body.supplierId);
      if (!sup) {
        return res.status(404).json({ success: false, error: "Supplier not found" });
      }
      features = {
        rating: sup.rating,
        active: sup.active ? 1 : 0,
        // Add more features as needed
      };
    }
    if (!features) {
      return res.status(400).json({ success: false, error: "No feature data provided" });
    }
    const response = await axios.post(`${ML_SERVICE_URL}/predict/supplier-risk`, { features });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.detail || error.message });
  }
});

// Test route to verify routing works
router.get("/test", (req, res) => {
  res.json({ success: true, message: "ML Finance routes are working!" });
});

// Get ML Service Status
router.get("/status", async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`);
    res.json({
      success: true,
      ml_service: response.data,
      service_url: ML_SERVICE_URL,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: "ML service is not available",
      message: error.message,
    });
  }
});

export default router;

