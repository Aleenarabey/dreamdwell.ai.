// routes/engineerRoutes.js
import express from 'express';
import Project from '../models/Project.js';
import Material from '../models/Material.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper function to verify engineer role
const verifyEngineer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'engineer') {
      return res.status(403).json({ message: 'Access denied: Engineers only' });
    }
    next();
  });
};

// Helper function to get io instance
const getIo = (req) => {
  return req.app.get('io');
};

// 🏠 Engineer API Root
router.get('/', verifyEngineer, (req, res) => {
  res.json({
    success: true,
    message: 'Engineer API root is working',
    availableRoutes: [
      '/dashboard',
      '/projects',
      '/projects/:id',
      '/projects/:projectId/milestones/:milestoneId',
      '/materials'
    ]
  });
});

// 🔍 Get Engineer Dashboard Data
router.get('/dashboard', verifyEngineer, async (req, res) => {
  try {
    const engineerId = req.user.id;
    
    // Get assigned projects
    const assignedProjects = await Project.find({
      'teamMembers.engineerId': engineerId,
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate progress for each project
    const projectsWithProgress = assignedProjects.map(project => {
      let progressPercentage = project.progressPercentage || 0;
      
      if (project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0) {
        const totalWeight = project.milestones.reduce((sum, m) => sum + (Number(m?.weight) || 0), 0);
        if (totalWeight > 0) {
          const completedWeight = project.milestones
            .filter(m => m && m.status === 'completed')
            .reduce((sum, m) => sum + (Number(m?.weight) || 0), 0);
          progressPercentage = Math.round((completedWeight / totalWeight) * 100);
        }
      }
      
      // Get milestones assigned to this engineer
      const assignedMilestones = project.milestones?.filter(
        m => m.assignedTo && m.assignedTo.toString() === engineerId
      ) || [];
      
      return {
        ...project,
        progressPercentage,
        assignedMilestones
      };
    });

    // Get project stats
    const activeProjects = projectsWithProgress.filter(p => p.status === 'active').length;
    const pendingProjects = projectsWithProgress.filter(p => p.status === 'pending').length;
    const completedProjects = projectsWithProgress.filter(p => p.status === 'completed').length;
    
    // Get pending milestones assigned to this engineer across all projects
    let pendingMilestonesCount = 0;
    let inProgressMilestonesCount = 0;
    
    projectsWithProgress.forEach(project => {
      project.assignedMilestones?.forEach(milestone => {
        if (milestone.status === 'pending') pendingMilestonesCount++;
        if (milestone.status === 'in_progress') inProgressMilestonesCount++;
      });
    });

    res.json({
      success: true,
      data: {
        projects: projectsWithProgress,
        stats: {
          totalProjects: projectsWithProgress.length,
          activeProjects,
          pendingProjects,
          completedProjects,
          pendingMilestones: pendingMilestonesCount,
          inProgressMilestones: inProgressMilestonesCount
        }
      }
    });
  } catch (err) {
    console.error('Error fetching engineer dashboard:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📋 Get Assigned Projects
router.get('/projects', verifyEngineer, async (req, res) => {
  try {
    const engineerId = req.user.id;
    
    const projects = await Project.find({
      'teamMembers.engineerId': engineerId,
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate progress for each project
    const projectsWithProgress = projects.map(project => {
      let progressPercentage = project.progressPercentage || 0;
      
      if (project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0) {
        const totalWeight = project.milestones.reduce((sum, m) => sum + (Number(m?.weight) || 0), 0);
        if (totalWeight > 0) {
          const completedWeight = project.milestones
            .filter(m => m && m.status === 'completed')
            .reduce((sum, m) => sum + (Number(m?.weight) || 0), 0);
          progressPercentage = Math.round((completedWeight / totalWeight) * 100);
        }
      }
      
      return {
        ...project,
        progressPercentage
      };
    });

    res.json(projectsWithProgress);
  } catch (err) {
    console.error('Error fetching assigned projects:', err);
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get Single Project Details
router.get('/projects/:id', verifyEngineer, async (req, res) => {
  try {
    const engineerId = req.user.id;
    const project = await Project.findById(req.params.id).lean();
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Verify engineer is assigned to this project
    const isAssigned = project.teamMembers?.some(
      member => member.engineerId && member.engineerId.toString() === engineerId
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'Access denied: You are not assigned to this project' });
    }
    
    // Calculate progress
    let progressPercentage = project.progressPercentage || 0;
    if (project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0) {
      const totalWeight = project.milestones.reduce((sum, m) => sum + (Number(m?.weight) || 0), 0);
      if (totalWeight > 0) {
        const completedWeight = project.milestones
          .filter(m => m && m.status === 'completed')
          .reduce((sum, m) => sum + (Number(m?.weight) || 0), 0);
        progressPercentage = Math.round((completedWeight / totalWeight) * 100);
      }
    }
    
    res.json({
      ...project,
      progressPercentage
    });
  } catch (err) {
    console.error('Error fetching project details:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📝 Update Milestone Status
router.patch('/projects/:projectId/milestones/:milestoneId', verifyEngineer, async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { status, notes } = req.body;
    
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Verify engineer is assigned to this project
    const isAssigned = project.teamMembers?.some(
      member => member.engineerId && member.engineerId.toString() === engineerId
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'Access denied: You are not assigned to this project' });
    }
    
    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    // Update milestone
    if (status) {
      milestone.status = status;
      if (status === 'completed') {
        milestone.completedAt = new Date();
      }
    }
    if (notes !== undefined) milestone.notes = notes;
    
    // Update progress from milestones
    project.updateProgressFromMilestones();
    
    // Check auto-completion
    const autoCompleted = project.checkAutoCompletion();
    
    await project.save();
    
    // Emit real-time update
    const io = getIo(req);
    if (io) {
      io.to('admin-room').emit('dashboard-update', {
        type: 'milestone-update',
        data: {
          type: status === 'completed' ? 'milestone-completed' : 'milestone-updated',
          projectId: project._id,
          projectName: project.name,
          milestoneTitle: milestone.title,
          updatedBy: engineerId
        },
        timestamp: new Date()
      });
      io.to('projects-room').emit('milestone-update', {
        type: status === 'completed' ? 'milestone-completed' : 'milestone-updated',
        projectId: project._id,
        projectName: project.name,
        milestoneTitle: milestone.title,
        status: status,
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      data: project,
      autoCompleted,
      notification: autoCompleted ? 
        { message: `Project "${project.name}" has been automatically marked as completed!`, type: 'success' } : 
        null
    });
  } catch (err) {
    console.error('Error updating milestone:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📦 Get Available Materials
router.get('/materials', verifyEngineer, async (req, res) => {
  try {
    const materials = await Material.find().sort({ name: 1 }).lean();
    res.json(materials);
  } catch (err) {
    console.error('Error fetching materials:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

