import express from "express";
import Project from "../models/Project.js";
import Material from "../models/Material.js";
import Labor from "../models/Labour.js"; // Note: file is Labour.js but model name is Labor
import User from "../models/User.js";

const router = express.Router();

// Helper function to get io instance
const getIo = (req) => {
  return req.app.get("io");
};

// ➕ Create Project
router.post("/", async (req, res) => {
  try {
    const project = await Project.create(req.body);
    const io = getIo(req);
    
    // Emit real-time update
    if (io) {
      io.to("admin-room").emit("dashboard-update", {
        type: "project-update",
        data: { type: "project-created", projectId: project._id, projectName: project.name },
        timestamp: new Date(),
      });
      io.to("projects-room").emit("project-update", {
        type: "project-created",
        projectId: project._id,
        projectName: project.name,
        status: "created",
        timestamp: new Date(),
      });
    }
    
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📋 Get All Projects (excluding drafts)
router.get("/", async (req, res) => {
  try {
    console.log("📋 Fetching all projects...");
    
    // Simple fetch first - no populate to avoid errors
    const projects = await Project.find({
      $or: [{ isDraft: { $exists: false } }, { isDraft: false }]
    })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${projects.length} projects`);
    
    // Calculate progress and format projects safely
    const formattedProjects = projects.map(project => {
      try {
        let progressPercentage = project.progressPercentage || 0;
        
        // Calculate progress from milestones safely
        if (project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0) {
          const totalWeight = project.milestones.reduce((sum, m) => {
            return sum + (Number(m?.weight) || 0);
          }, 0);
          
          if (totalWeight > 0) {
            const completedWeight = project.milestones
              .filter(m => m && m.status === 'completed')
              .reduce((sum, m) => sum + (Number(m?.weight) || 0), 0);
            progressPercentage = Math.round((completedWeight / totalWeight) * 100);
          }
        }
        
        // Ensure all required fields exist
        return {
          _id: project._id,
          name: project.name || 'Unnamed Project',
          clientName: project.clientName || 'N/A',
          status: project.status || 'pending',
          budget: project.budget || 0,
          startDate: project.startDate,
          endDate: project.endDate,
          address: project.address || '',
          progressPercentage,
          milestones: project.milestones || [],
          materials: project.materials || [],
          labors: project.labors || [],
          teamMembers: project.teamMembers || [],
          notes: project.notes || '',
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        };
      } catch (formatError) {
        console.error(`Error formatting project ${project._id}:`, formatError.message);
        // Return minimal safe project data
        return {
          _id: project._id,
          name: project.name || 'Unnamed Project',
          clientName: project.clientName || 'N/A',
          status: project.status || 'pending',
          budget: project.budget || 0,
          progressPercentage: 0,
          milestones: []
        };
      }
    });
    
    console.log(`✅ Returning ${formattedProjects.length} formatted projects`);
    res.json(formattedProjects);
  } catch (err) {
    console.error("❌ Error in GET /api/projects:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      error: err.message || "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// 🔍 Get One Project
router.get("/:id", async (req, res) => {
  try {
    // Fetch without populate to avoid model reference errors
    const project = await Project.findById(req.params.id).lean();
    
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    // Calculate progress safely
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
    
    // Return formatted project
    res.json({
      ...project,
      progressPercentage
    });
  } catch (err) {
    console.error("Error fetching single project:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Project
router.put("/:id", async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    const io = getIo(req);
    
    // Emit real-time update
    if (io) {
      io.to("admin-room").emit("dashboard-update", {
        type: "project-update",
        data: { type: "project-updated", projectId: updated._id, projectName: updated.name },
        timestamp: new Date(),
      });
      io.to("projects-room").emit("project-update", {
        type: "project-updated",
        projectId: updated._id,
        projectName: updated.name,
        status: "updated",
        timestamp: new Date(),
      });
      
      // If status changed, emit status change event
      if (req.body.status) {
        io.to("projects-room").emit("project-update", {
          type: "project-status-changed",
          projectId: updated._id,
          projectName: updated.name,
          newStatus: req.body.status,
          status: "status-changed",
          timestamp: new Date(),
        });
      }
    }
    
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    await Project.findByIdAndDelete(req.params.id);
    const io = getIo(req);
    
    // Emit real-time update
    if (io && project) {
      io.to("admin-room").emit("dashboard-update", {
        type: "project-update",
        data: { type: "project-deleted", projectId: req.params.id, projectName: project.name },
        timestamp: new Date(),
      });
      io.to("projects-room").emit("project-update", {
        type: "project-deleted",
        projectId: req.params.id,
        projectName: project.name,
        status: "deleted",
        timestamp: new Date(),
      });
    }
    
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💵 Calculate Project Total Estimate
router.get("/:id/cost", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Calculate material cost safely
    let materialCost = 0;
    if (project.materials && Array.isArray(project.materials)) {
      for (const item of project.materials) {
        try {
          if (item.material && typeof item.material === 'object' && item.material.unitPrice) {
            materialCost += (item.material.unitPrice || 0) * (item.quantity || 0);
          } else if (typeof item.material === 'string') {
            // If not populated, would need to fetch material separately
            // For now, skip unpopulated materials
          }
        } catch (e) {
          console.error(`Error calculating material cost for item:`, e);
        }
      }
    }

    // Calculate labor cost safely
    let laborCost = 0;
    if (project.labors && Array.isArray(project.labors)) {
      for (const item of project.labors) {
        try {
          if (item.labor && typeof item.labor === 'object') {
            const dailyRate = item.labor.dailyRate || (item.labor.hourlyRate || 0) * (item.labor.dailyHours || 8);
            laborCost += dailyRate * (item.days || 0);
          } else if (typeof item.labor === 'string') {
            // If not populated, would need to fetch labor separately
            // For now, skip unpopulated labors
          }
        } catch (e) {
          console.error(`Error calculating labor cost for item:`, e);
        }
      }
    }

    const total = materialCost + laborCost;
    res.json({ materialCost, laborCost, total });
  } catch (err) {
    console.error("Error calculating project cost:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== MILESTONE MANAGEMENT ====================

// ➕ Add Milestone to Project
router.post("/:id/milestones", async (req, res) => {
  try {
    const { title, description, weight, dueDate, assignedTo, notes } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    const milestone = {
      title,
      description,
      weight: weight || 0,
      status: 'pending',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo: assignedTo || null,
      notes
    };
    
    project.milestones.push(milestone);
    project.updateProgressFromMilestones();
    project.checkAutoCompletion();
    
    await project.save();
    
    const io = getIo(req);
    if (io) {
      io.to("admin-room").emit("dashboard-update", {
        type: "milestone-update",
        data: {
          type: "milestone-added",
          projectId: project._id,
          projectName: project.name,
          milestoneTitle: title,
        },
        timestamp: new Date(),
      });
      io.to("projects-room").emit("milestone-update", {
        type: "milestone-added",
        projectId: project._id,
        projectName: project.name,
        milestoneTitle: title,
        status: "added",
        timestamp: new Date(),
      });
    }
    
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Update Milestone Status
router.patch("/:id/milestones/:milestoneId", async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    
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
    const notification = autoCompleted ? 
      { message: `Project "${project.name}" has been automatically marked as completed!`, type: 'success' } : 
      null;
    
    await project.save();
    
    const io = getIo(req);
    if (io) {
      const milestoneTitle = milestone.title;
      io.to("admin-room").emit("dashboard-update", {
        type: "milestone-update",
        data: {
          type: status === "completed" ? "milestone-completed" : "milestone-updated",
          projectId: project._id,
          projectName: project.name,
          milestoneTitle: milestoneTitle,
        },
        timestamp: new Date(),
      });
      io.to("projects-room").emit("milestone-update", {
        type: status === "completed" ? "milestone-completed" : "milestone-updated",
        projectId: project._id,
        projectName: project.name,
        milestoneTitle: milestoneTitle,
        status: status,
        timestamp: new Date(),
      });
      
      // Emit progress update
      io.to("projects-room").emit("project-progress-update", {
        projectId: project._id,
        projectName: project.name,
        progressPercentage: project.progressPercentage,
        timestamp: new Date(),
      });
    }
    
    res.json({ 
      success: true, 
      data: project,
      updatedProject: project,
      autoCompleted,
      notification 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Update Milestone
router.put("/:id/milestones/:milestoneId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    
    Object.assign(milestone, req.body);
    if (req.body.dueDate) {
      milestone.dueDate = new Date(req.body.dueDate);
    }
    
    project.updateProgressFromMilestones();
    project.checkAutoCompletion();
    
    await project.save();
    
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete Milestone
router.delete("/:id/milestones/:milestoneId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    project.milestones.id(req.params.milestoneId).remove();
    project.updateProgressFromMilestones();
    project.checkAutoCompletion();
    
    await project.save();
    
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔄 Auto-Update Project Status (for cron jobs or manual triggers)
router.post("/:id/auto-update-status", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    // Update progress from milestones
    project.updateProgressFromMilestones();
    
    // Check status transitions
    const activated = project.checkAutoActivation();
    const completed = project.checkAutoCompletion();
    
    await project.save();
    
    res.json({
      success: true,
      progress: project.progressPercentage,
      status: project.status,
      activated,
      completed,
      notification: completed ? 
        { message: `Project "${project.name}" has been automatically marked as completed!`, type: 'success' } : 
        null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Get Project Progress Report
router.get("/:id/progress", async (req, res) => {
  try {
    // Fetch without populate to avoid model reference errors
    const project = await Project.findById(req.params.id).lean();
    
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    // Calculate progress from milestones
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
    
    const completed = project.milestones?.filter(m => m.status === 'completed') || [];
    const inProgress = project.milestones?.filter(m => m.status === 'in_progress') || [];
    const pending = project.milestones?.filter(m => m.status === 'pending') || [];
    
    res.json({
      success: true,
      progress: progressPercentage,
      status: project.status,
      milestones: {
        total: project.milestones?.length || 0,
        completed: completed.length,
        inProgress: inProgress.length,
        pending: pending.length
      },
      completedMilestones: completed,
      inProgressMilestones: inProgress,
      pendingMilestones: pending
    });
  } catch (err) {
    console.error("Error fetching project progress:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
