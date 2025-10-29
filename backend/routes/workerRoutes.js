import express from "express";
import Worker from "../models/Worker.js";
import Project from "../models/Project.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save photos to public/worker folder
    const uploadPath = path.join(__dirname, "../public/worker");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `worker-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg/jpg/png) and PDF files are allowed"));
    }
  },
});

// 📋 Get All Workers
router.get("/", async (req, res) => {
  try {
    const { search, skillType, status, projectId } = req.query;
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { workerId: { $regex: search, $options: "i" } },
        { "contact.phone": { $regex: search, $options: "i" } },
      ];
    }

    // Skill filter
    if (skillType) {
      query.skillType = skillType;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Project filter
    if (projectId) {
      query["assignedProject.projectId"] = projectId;
    }

    const workers = await Worker.find(query)
      .populate("assignedProject.projectId", "name address")
      .sort({ createdAt: -1 })
      .lean();

    res.json(workers);
  } catch (err) {
    console.error("Error fetching workers:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get One Worker
router.get("/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate("assignedProject.projectId", "name address status")
      .lean();

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json(worker);
  } catch (err) {
    console.error("Error fetching worker:", err);
    res.status(500).json({ error: err.message });
  }
});

// ➕ Create New Worker
router.post("/", upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
  { name: "skillCert", maxCount: 1 },
  { name: "medical", maxCount: 1 },
  { name: "background", maxCount: 1 },
]), async (req, res) => {
  try {
    const files = req.files || {};
    const body = req.body;

    // Parse JSON fields if they're strings
    let contact = body.contact;
    let emergencyContact = body.emergencyContact;
    let documents = body.documents;
    let assignedProject = body.assignedProject;
    let wages = body.wages;

    try {
      if (typeof contact === "string" && contact) contact = JSON.parse(contact);
      if (typeof emergencyContact === "string" && emergencyContact) emergencyContact = JSON.parse(emergencyContact);
      if (typeof documents === "string" && documents) documents = JSON.parse(documents);
      if (typeof assignedProject === "string" && assignedProject) assignedProject = JSON.parse(assignedProject);
      if (typeof wages === "string" && wages) wages = JSON.parse(wages);
    } catch (parseError) {
      console.error("Error parsing JSON fields:", parseError);
      return res.status(400).json({ error: "Invalid JSON format in request fields" });
    }

    // Ensure objects are initialized if not provided
    if (!contact) contact = {};
    if (!emergencyContact) emergencyContact = {};
    if (!documents) documents = {};
    if (!assignedProject) assignedProject = {};
    if (!wages) wages = {};

    // Handle file uploads - photos go to public/worker folder
    if (files.photo && files.photo[0]) {
      body.photo = `/worker/${files.photo[0].filename}`;
    }

    if (files.idProof && files.idProof[0]) {
      if (!documents) documents = {};
      if (!documents.idProof) documents.idProof = {};
      documents.idProof.file = `/worker/${files.idProof[0].filename}`;
    }

    if (files.skillCert && files.skillCert[0]) {
      if (!documents) documents = {};
      if (!documents.skillCert) documents.skillCert = {};
      documents.skillCert.file = `/worker/${files.skillCert[0].filename}`;
    }

    if (files.medical && files.medical[0]) {
      if (!documents) documents = {};
      if (!documents.medical) documents.medical = {};
      documents.medical.file = `/worker/${files.medical[0].filename}`;
    }

    if (files.background && files.background[0]) {
      if (!documents) documents = {};
      if (!documents.background) documents.background = {};
      documents.background.file = `/worker/${files.background[0].filename}`;
    }

    // Parse skills array
    let skills = body.skills;
    if (typeof skills === "string") {
      skills = skills.split(",").map((s) => s.trim());
    }

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return res.status(400).json({ error: "Worker name is required" });
    }
    if (!contact || !contact.phone || !contact.phone.trim()) {
      return res.status(400).json({ error: "Contact number is required" });
    }
    if (!body.skillType || !body.skillType.trim()) {
      return res.status(400).json({ error: "Skill type is required" });
    }

    // Create worker data
    const workerData = {
      name: body.name.trim(),
      photo: body.photo || null,
      contact: contact || {},
      emergencyContact: emergencyContact || {},
      skillType: body.skillType.trim(),
      skills: skills || [],
      experience: {
        years: parseInt(body.experienceYears) || 0,
      },
      joiningDate: body.joiningDate ? new Date(body.joiningDate) : new Date(),
      documents: documents || {},
      assignedProject: assignedProject || {},
      wages: wages || {},
      status: body.status || "Active",
      notes: body.notes || "",
    };

    // If project is assigned, get project name
    if (assignedProject?.projectId && typeof assignedProject.projectId === "string" && assignedProject.projectId.trim() !== "") {
      try {
        const project = await Project.findById(assignedProject.projectId.trim());
        if (project) {
          workerData.assignedProject = {
            ...assignedProject,
            projectId: project._id,
            projectName: project.name,
          };
        } else {
          // If project not found, remove the assignment
          workerData.assignedProject = {};
        }
      } catch (err) {
        console.error("Error finding project:", err);
        // If invalid projectId, remove the assignment
        workerData.assignedProject = {};
      }
    } else {
      // No project assigned
      workerData.assignedProject = {};
    }

    const worker = await Worker.create(workerData);

    // Get io instance for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to("workers-room").emit("worker-update", {
        type: "worker-created",
        worker: worker,
        timestamp: new Date(),
      });
    }

    res.status(201).json(worker);
  } catch (err) {
    console.error("Error creating worker:", err);
    // Provide more detailed error messages
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ error: `Validation error: ${validationErrors}` });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: "Duplicate worker ID. Please try again." });
    }
    res.status(400).json({ error: err.message || "Failed to create worker" });
  }
});

// ✏️ Update Worker
router.put("/:id", upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
  { name: "skillCert", maxCount: 1 },
  { name: "medical", maxCount: 1 },
  { name: "background", maxCount: 1 },
]), async (req, res) => {
  try {
    const files = req.files || {};
    const body = req.body;

    // Parse JSON fields
    let contact = body.contact;
    let emergencyContact = body.emergencyContact;
    let documents = body.documents;
    let assignedProject = body.assignedProject;
    let wages = body.wages;

    try {
      if (typeof contact === "string" && contact) contact = JSON.parse(contact);
      if (typeof emergencyContact === "string" && emergencyContact) emergencyContact = JSON.parse(emergencyContact);
      if (typeof documents === "string" && documents) documents = JSON.parse(documents);
      if (typeof assignedProject === "string" && assignedProject) assignedProject = JSON.parse(assignedProject);
      if (typeof wages === "string" && wages) wages = JSON.parse(wages);
    } catch (parseError) {
      console.error("Error parsing JSON fields:", parseError);
      return res.status(400).json({ error: "Invalid JSON format in request fields" });
    }

    // Ensure objects are initialized if not provided
    if (!contact) contact = {};
    if (!emergencyContact) emergencyContact = {};
    if (!documents) documents = {};
    if (!assignedProject) assignedProject = {};
    if (!wages) wages = {};

    // Handle file uploads (only if new files are provided) - photos go to public/worker folder
    if (files.photo && files.photo[0]) {
      body.photo = `/worker/${files.photo[0].filename}`;
    }

    if (files.idProof && files.idProof[0]) {
      if (!documents) documents = {};
      if (!documents.idProof) documents.idProof = {};
      documents.idProof.file = `/worker/${files.idProof[0].filename}`;
    }

    if (files.skillCert && files.skillCert[0]) {
      if (!documents) documents = {};
      if (!documents.skillCert) documents.skillCert = {};
      documents.skillCert.file = `/worker/${files.skillCert[0].filename}`;
    }

    if (files.medical && files.medical[0]) {
      if (!documents) documents = {};
      if (!documents.medical) documents.medical = {};
      documents.medical.file = `/worker/${files.medical[0].filename}`;
    }

    if (files.background && files.background[0]) {
      if (!documents) documents = {};
      if (!documents.background) documents.background = {};
      documents.background.file = `/worker/${files.background[0].filename}`;
    }

    // Parse skills array
    let skills = body.skills;
    if (typeof skills === "string") {
      skills = skills.split(",").map((s) => s.trim());
    }

    // Update worker
    const updateData = {
      name: body.name,
      contact: contact,
      emergencyContact: emergencyContact,
      skillType: body.skillType,
      skills: skills,
      experience: {
        years: parseInt(body.experienceYears) || 0,
      },
      joiningDate: body.joiningDate ? new Date(body.joiningDate) : undefined,
      assignedProject: assignedProject,
      wages: wages,
      status: body.status,
      notes: body.notes,
    };

    // Handle photo update
    if (body.photo) {
      updateData.photo = body.photo;
    }

    // Handle documents update
    if (documents) {
      updateData.documents = documents;
    }

    // If project is assigned, get project name
    if (assignedProject?.projectId && typeof assignedProject.projectId === "string" && assignedProject.projectId.trim() !== "") {
      try {
        const project = await Project.findById(assignedProject.projectId.trim());
        if (project) {
          updateData.assignedProject = {
            ...assignedProject,
            projectId: project._id,
            projectName: project.name,
          };
        } else {
          // If project not found, remove the assignment
          updateData.assignedProject = {};
        }
      } catch (err) {
        console.error("Error finding project:", err);
        // If invalid projectId, remove the assignment
        updateData.assignedProject = {};
      }
    } else {
      // No project assigned
      updateData.assignedProject = {};
    }

    const worker = await Worker.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Get io instance for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to("workers-room").emit("worker-update", {
        type: "worker-updated",
        worker: worker,
        timestamp: new Date(),
      });
    }

    res.json(worker);
  } catch (err) {
    console.error("Error updating worker:", err);
    // Provide more detailed error messages
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ error: `Validation error: ${validationErrors}` });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: "Duplicate worker ID. Please try again." });
    }
    res.status(400).json({ error: err.message || "Failed to update worker" });
  }
});

// 🗑️ Delete Worker
router.delete("/:id", async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Get io instance for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to("workers-room").emit("worker-update", {
        type: "worker-deleted",
        workerId: req.params.id,
        timestamp: new Date(),
      });
    }

    res.json({ message: "Worker deleted successfully" });
  } catch (err) {
    console.error("Error deleting worker:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📍 Assign/Reassign Worker to Project
router.patch("/:id/assign-project", async (req, res) => {
  try {
    const { projectId, site, assignedDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      {
        "assignedProject.projectId": projectId,
        "assignedProject.projectName": project.name,
        "assignedProject.site": site || "",
        "assignedProject.assignedDate": assignedDate ? new Date(assignedDate) : new Date(),
      },
      { new: true }
    ).populate("assignedProject.projectId", "name address");

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Get io instance for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to("workers-room").emit("worker-update", {
        type: "worker-assigned",
        worker: worker,
        timestamp: new Date(),
      });
    }

    res.json(worker);
  } catch (err) {
    console.error("Error assigning worker:", err);
    res.status(400).json({ error: err.message });
  }
});

// 👥 Bulk Assign Workers to Project
router.patch("/bulk-assign", async (req, res) => {
  try {
    const { workerIds, projectId, site, assignedDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const workers = await Worker.updateMany(
      { _id: { $in: workerIds } },
      {
        "assignedProject.projectId": projectId,
        "assignedProject.projectName": project.name,
        "assignedProject.site": site || "",
        "assignedProject.assignedDate": assignedDate ? new Date(assignedDate) : new Date(),
      }
    );

    // Get io instance for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to("workers-room").emit("worker-update", {
        type: "workers-bulk-assigned",
        workerIds: workerIds,
        projectId: projectId,
        timestamp: new Date(),
      });
    }

    res.json({ message: `${workers.modifiedCount} workers assigned successfully` });
  } catch (err) {
    console.error("Error bulk assigning workers:", err);
    res.status(400).json({ error: err.message });
  }
});

// 📊 Update Attendance
router.patch("/:id/attendance", async (req, res) => {
  try {
    const { status, date } = req.body;

    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const updateData = {
      "attendance.todayStatus": status,
      "attendance.lastAttendanceDate": attendanceDate,
    };

    // Increment days worked if present
    if (status === "Present" || status === "Half Day") {
      // Only increment if not already counted for today
      if (!worker.attendance?.lastAttendanceDate || 
          worker.attendance.lastAttendanceDate.toDateString() !== attendanceDate.toDateString()) {
        updateData.totalDaysWorked = (worker.totalDaysWorked || 0) + (status === "Present" ? 1 : 0.5);
      }
    }

    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Get io instance for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to("workers-room").emit("worker-update", {
        type: "attendance-updated",
        workerId: req.params.id,
        status: status,
        timestamp: new Date(),
      });
    }

    res.json(updatedWorker);
  } catch (err) {
    console.error("Error updating attendance:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
