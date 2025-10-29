import express from 'express';
import Project from '../models/Project.js';
import Material from '../models/Material.js';
import User from '../models/User.js';
import Quotation from '../models/Quotation.js';

const router = express.Router();

// Get Admin Dashboard Statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get total projects by status (excluding drafts)
    const totalProjects = await Project.countDocuments({ 
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    });
    const activeProjects = await Project.countDocuments({ 
      status: 'active',
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    });
    const pendingProjects = await Project.countDocuments({ 
      status: 'pending',
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    });
    const completedProjects = await Project.countDocuments({ 
      status: 'completed',
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    }) || 0;

    // Get total clients and engineers
    const totalClients = await User.countDocuments({ role: 'customer' });
    const totalEngineers = await User.countDocuments({ role: 'engineer' });

    // Get revenue from accepted quotations
    const acceptedQuotations = await Quotation.find({ status: 'accepted' });
    const totalRevenue = acceptedQuotations.reduce((sum, q) => sum + (q.total || 0), 0);

    // Get recent projects for dashboard
    const recentProjects = await Project.find({
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name clientName status budget createdAt');
    
    // Calculate expenses from materials used in projects
    const projects = await Project.find({
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    }).populate('materials.material');
    let totalExpenses = 0;
    
    projects.forEach(project => {
      if (project.materials && project.materials.length > 0) {
        project.materials.forEach(item => {
          if (item.material && item.material.unitPrice) {
            totalExpenses += item.material.unitPrice * (item.quantity || 0);
          }
        });
      }
    });

    // Calculate profit
    const profit = totalRevenue - totalExpenses;

    // Get low stock materials
    const lowStockMaterials = await Material.find({
      $expr: { $lt: ['$stock', '$reorderLevel'] }
    }).populate('supplier', 'name email').limit(10);

    // Calculate Budget Consumption
    const allProjects = await Project.find({
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    });
    const totalBudget = allProjects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
    const consumedBudget = totalExpenses;
    const remainingBudget = totalBudget - consumedBudget;
    const consumptionPercentage = totalBudget > 0 ? (consumedBudget / totalBudget) * 100 : 0;

    // Calculate Material Usage
    const totalMaterials = await Material.countDocuments();
    const lowStockCount = lowStockMaterials.length;
    // Count consumed materials (materials used in projects)
    let consumedMaterials = 0;
    projects.forEach(project => {
      if (project.materials && project.materials.length > 0) {
        consumedMaterials += project.materials.length;
      }
    });

    // Get project distribution data for charts
    const projectDistribution = [
      { name: 'Active', value: activeProjects, color: '#3B82F6' },
      { name: 'Pending', value: pendingProjects, color: '#F59E0B' },
      { name: 'Completed', value: completedProjects, color: '#10B981' }
    ];

    // Get financial overview data
    const financialOverview = [
      { name: 'Revenue', value: totalRevenue, color: '#10B981' },
      { name: 'Expenses', value: totalExpenses, color: '#EF4444' },
      { name: 'Profit', value: profit, color: '#3B82F6' }
    ];

    res.json({
      success: true,
      data: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          pending: pendingProjects,
          completed: completedProjects
        },
        projectsList: recentProjects.map(p => ({
          name: p.name,
          client: p.clientName || 'N/A',
          status: p.status === 'active' ? 'Active' : p.status === 'pending' ? 'Pending' : 'Completed',
          budget: `₹${(p.budget || 0).toLocaleString('en-IN')}`
        })),
        users: {
          clients: totalClients,
          engineers: totalEngineers
        },
        financial: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          profit: profit
        },
        lowStockAlerts: lowStockMaterials.map(m => ({
          name: m.name,
          stock: m.stock,
          reorderLevel: m.reorderLevel,
          unit: m.unit,
          supplier: m.supplier?.name || 'No supplier'
        })),
        budgetConsumption: {
          totalBudget,
          consumedBudget,
          remainingBudget,
          consumptionPercentage
        },
        materialUsage: {
          totalMaterials,
          lowStockCount,
          consumedMaterials
        },
        charts: {
          projectDistribution,
          financialOverview
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
});

// Get Users by Role (for engineers, customers, etc.)
router.get('/users', async (req, res) => {
  try {
    console.log('📋 GET /api/admin/users called with query:', req.query);
    const { role } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
      console.log(`🔍 Filtering users by role: ${role}`);
    }
    
    const users = await User.find(query)
      .select('firstName lastName email role')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${users.length} users`);
    
    // Format response to include full name
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

export default router;

