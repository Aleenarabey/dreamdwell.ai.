import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { Server } from "socket.io";
import { createServer } from "http";

// --- Existing DreamDwell routes ---
import interiorAuthRoutes from "./routes/interiorAuth.js";
import floorplanRoutes from "./routes/floorplan.js";
import authRoutes from "./routes/auth.js";

// --- New Construction Management routes ---
import materialRoutes from "./routes/materialRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import labourRoutes from "./routes/labourRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import engineerRoutes from "./routes/engineerRoutes.js";

import FloorPlan from "./models/floorplan.model.js";
import upload from "./middleware/multerImageUpload.js";
// Import Labor model first to ensure it's registered before Project references it
import Labor from "./models/Labour.js";
import Project from "./models/Project.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);

// ========== SOCKET.IO SETUP ==========
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Admin joins admin room for real-time updates
  socket.on("join-admin-room", () => {
    socket.join("admin-room");
    console.log("Admin joined admin-room");
  });

  // Join projects room for project management real-time updates
  socket.on("join-projects-room", () => {
    socket.join("projects-room");
    console.log("Client joined projects-room");
  });

  // Join workers room for workers management real-time updates
  socket.on("join-workers-room", () => {
    socket.join("workers-room");
    console.log("Client joined workers-room");
  });

  // Join finance room for finance management real-time updates
  socket.on("join-finance-room", () => {
    socket.join("finance-room");
    console.log("Client joined finance-room");
  });

  // Handle project updates from engineers
  socket.on("project-update", async (data) => {
    try {
      // Broadcast to admin room
      io.to("admin-room").emit("dashboard-update", {
        type: "project-update",
        data: data,
        timestamp: new Date(),
      });
      console.log("📊 Dashboard update sent to admin:", data);
    } catch (error) {
      console.error("Error broadcasting update:", error);
    }
  });

  // Handle milestone updates
  socket.on("milestone-update", (data) => {
    io.to("admin-room").emit("dashboard-update", {
      type: "milestone-update",
      data: data,
      timestamp: new Date(),
    });
  });

  // Handle material updates
  socket.on("material-update", (data) => {
    io.to("admin-room").emit("dashboard-update", {
      type: "material-update",
      data: data,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Export io for use in routes
app.set("io", io);

// ========== MIDDLEWARES ==========
app.use(express.json());

// --- Configure allowed origins ---
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
).split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// --- Static folder for uploads ---
const uploadsDir = path.resolve("uploads");
app.use("/uploads", express.static(uploadsDir));

// --- Static folder for public files (worker photos, etc.) ---
const publicDir = path.resolve("public");
app.use(express.static(publicDir));


// ========== EXISTING DREAMDWELL ROUTES ==========
app.use("/api/interiorAuth", interiorAuthRoutes);
app.use("/api/auth", authRoutes);
app.use("/", floorplanRoutes);

// --- Floorplan Upload Route ---
app.post("/api/floorplans/upload", upload.single("image"), async (req, res) => {
  try {
    const floorPlan = new FloorPlan({
      userId: req.body.userId || null,
      name: req.body.name || "Untitled Floor Plan",
      originalImage: req.file ? req.file.path : null,
      generatedWalls: req.body.generatedWalls
        ? JSON.parse(req.body.generatedWalls)
        : {},
      generatedInteriors: {
        format: req.body.format || null,
        filePath: req.body.filePath || null,
      },
    });

    const saved = await floorPlan.save();
    res.json(saved);
  } catch (err) {
    console.error("❌ Error saving floorplan:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Floorplan management routes ---
app.get("/api/floorplans", async (req, res) => {
  try {
    const plans = await FloorPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/floorplans/:id", async (req, res) => {
  try {
    const plan = await FloorPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Floor plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/floorplans/:id", async (req, res) => {
  try {
    const plan = await FloorPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ error: "Floor plan not found" });
    res.json({ message: "Floor plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DWG file upload route ---
app.post("/api/upload-dwg", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded or invalid file type" });
  }
  try {
    res.json({
      message: "DWG file uploaded successfully",
      filename: req.file.filename,
      path: req.file.path
    });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).send({ error: "Failed to upload file" });
  }
});


// ========== NEW CONSTRUCTION COMPANY MODULES ==========
app.use("/api/materials", materialRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/labor", labourRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/engineer", engineerRoutes);


// ========== DATABASE CONNECTION ==========
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));


// ========== AUTO-MARK ABSENT SCHEDULER ==========
const markAbsentAfterCutoff = async () => {
  try {
    const User = (await import('./models/User.js')).default;
    const Attendance = (await import('./models/Attendance.js')).default;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set cutoff time (e.g., 10:00 AM)
    const cutoffTime = new Date(today);
    cutoffTime.setHours(10, 0, 0, 0); // 10:00 AM cutoff
    
    const now = new Date();
    
    // Only run if cutoff time has passed
    if (now > cutoffTime) {
      const engineers = await User.find({ role: 'engineer' });
      let markedCount = 0;
      
      for (const engineer of engineers) {
        const attendance = await Attendance.findOne({
          userId: engineer._id,
          date: today
        });
        
        // If no attendance record or no check-in, mark as absent
        if (!attendance || !attendance.checkIn) {
          if (attendance) {
            attendance.status = 'absent';
            await attendance.save();
          } else {
            await Attendance.create({
              userId: engineer._id,
              date: today,
              status: 'absent',
              markedAt: now
            });
          }
          markedCount++;
        }
      }
      
      console.log(`⏰ Auto-marked ${markedCount} engineers as absent (cutoff: 10:00 AM)`);
    }
  } catch (error) {
    console.error('Error in auto-mark absent job:', error);
  }
};

// Run the job every hour
setInterval(markAbsentAfterCutoff, 60 * 60 * 1000);

// ========== SERVER START ==========
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔌 Socket.io enabled for real-time updates`);
  console.log(`⏰ Auto-mark absent scheduler enabled (cutoff: 10:00 AM)`);
});







