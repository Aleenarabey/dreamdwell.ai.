import mongoose from "mongoose";
import dotenv from "dotenv";
import Supplier from "../models/Supplier.js";
import Material from "../models/Material.js";
import Project from "../models/Project.js";
import Worker from "../models/Worker.js";
import Expense from "../models/Expense.js";
import Payment from "../models/Payment.js";

dotenv.config();

// Sample Suppliers Data
const sampleSuppliers = [
  {
    name: "UltraTech Cement Ltd",
    contact: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@ultratech.in",
    address: "Mumbai, Maharashtra",
    rating: 5,
    active: true,
  },
  {
    name: "TATA Steel Ltd",
    contact: "Priya Sharma",
    phone: "9876543211",
    email: "priya@tata.in",
    address: "Kolkata, West Bengal",
    rating: 5,
    active: true,
  },
  {
    name: "JSW Steel",
    contact: "Amit Patel",
    phone: "9876543212",
    email: "amit@jsw.in",
    address: "Vijayanagar, Karnataka",
    rating: 4,
    active: true,
  },
  {
    name: "Ambuja Cements",
    contact: "Sneha Reddy",
    phone: "9876543213",
    email: "sneha@ambuja.in",
    address: "Ahmedabad, Gujarat",
    rating: 4,
    active: true,
  },
  {
    name: "ACC Limited",
    contact: "Vikram Singh",
    phone: "9876543214",
    email: "vikram@acc.in",
    address: "Mumbai, Maharashtra",
    rating: 4,
    active: true,
  },
  {
    name: "Shree Cement",
    contact: "Anjali Verma",
    phone: "9876543215",
    email: "anjali@shree.in",
    address: "Rajasthan",
    rating: 4,
    active: true,
  },
  {
    name: "JK Cement",
    contact: "Rohit Desai",
    phone: "9876543216",
    email: "rohit@jkcement.in",
    address: "Delhi",
    rating: 4,
    active: true,
  },
  {
    name: "Birla Corporation",
    contact: "Neha Gupta",
    phone: "9876543217",
    email: "neha@birla.in",
    address: "Kolkata, West Bengal",
    rating: 4,
    active: true,
  },
  {
    name: "India Cements",
    contact: "Suresh Nair",
    phone: "9876543218",
    email: "suresh@indiacements.in",
    address: "Chennai, Tamil Nadu",
    rating: 4,
    active: true,
  },
  {
    name: "RCC Supplies",
    contact: "Meera Iyer",
    phone: "9876543219",
    email: "meera@rcc.in",
    address: "Bangalore, Karnataka",
    rating: 5,
    active: true,
  },
];

// Sample Materials Data
const sampleMaterials = [
  {
    name: "Cement (OPC 53 Grade)",
    unit: "bag",
    unitPrice: 450,
    co2PerUnit: 25,
    stock: 250,
    reorderLevel: 100,
    description: "Ordinary Portland Cement 53 Grade, 50kg bag",
  },
  {
    name: "Reinforcement Steel (TMT)",
    unit: "tonne",
    unitPrice: 60000,
    co2PerUnit: 1900,
    stock: 15,
    reorderLevel: 5,
    description: "TMT Steel bars, 12mm diameter",
  },
  {
    name: "River Sand",
    unit: "m3",
    unitPrice: 1200,
    co2PerUnit: 50,
    stock: 50,
    reorderLevel: 20,
    description: "Fine river sand for construction",
  },
  {
    name: "Coarse Aggregate (20mm)",
    unit: "m3",
    unitPrice: 800,
    co2PerUnit: 30,
    stock: 80,
    reorderLevel: 30,
    description: "Crushed stone aggregate 20mm",
  },
  {
    name: "Red Bricks (First Class)",
    unit: "piece",
    unitPrice: 8,
    co2PerUnit: 0.5,
    stock: 15000,
    reorderLevel: 5000,
    description: "First class red bricks",
  },
  {
    name: "Wire Mesh",
    unit: "sqft",
    unitPrice: 35,
    co2PerUnit: 2,
    stock: 500,
    reorderLevel: 200,
    description: "Welded wire mesh for reinforcement",
  },
  {
    name: "Paint (Premium)",
    unit: "litre",
    unitPrice: 450,
    co2PerUnit: 15,
    stock: 120,
    reorderLevel: 50,
    description: "Premium exterior paint, weatherproof",
  },
  {
    name: "PVC Pipes (4 inch)",
    unit: "piece",
    unitPrice: 850,
    co2PerUnit: 5,
    stock: 200,
    reorderLevel: 80,
    description: "PVC pipes for plumbing, 4 inch diameter",
  },
  {
    name: "Electrical Wires",
    unit: "kg",
    unitPrice: 180,
    co2PerUnit: 3,
    stock: 500,
    reorderLevel: 200,
    description: "Copper electrical wires, 1.5 sqmm",
  },
  {
    name: "Tiles (Ceramic Floor)",
    unit: "sqft",
    unitPrice: 55,
    co2PerUnit: 4,
    stock: 800,
    reorderLevel: 300,
    description: "Premium ceramic floor tiles, 2x2 feet",
  },
];

// Sample Projects Data
const sampleProjects = [
  {
    name: "Villa Greens",
    clientName: "Mr. Ramesh Sharma",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-12-31"),
    budget: 25000000,
    address: "Sector 45, Noida, UP",
    status: "active",
    progressPercentage: 45,
    notes: "Residential villa project with modern amenities",
  },
  {
    name: "EcoHomes Residential Complex",
    clientName: "Ms. Priya Nair",
    startDate: new Date("2025-02-01"),
    endDate: new Date("2026-03-31"),
    budget: 50000000,
    address: "Whitefield, Bangalore, Karnataka",
    status: "active",
    progressPercentage: 28,
    notes: "Green building project with sustainable features",
  },
  {
    name: "Skyline Towers",
    clientName: "Mr. Ajay Kapoor",
    startDate: new Date("2024-11-01"),
    endDate: new Date("2025-10-31"),
    budget: 75000000,
    address: "Andheri West, Mumbai, Maharashtra",
    status: "active",
    progressPercentage: 62,
    notes: "High-rise apartment complex, 15 floors",
  },
  {
    name: "Tech Park Office Building",
    clientName: "Ms. Kavita Reddy",
    startDate: new Date("2025-03-01"),
    endDate: new Date("2026-02-28"),
    budget: 60000000,
    address: "Hitech City, Hyderabad, Telangana",
    status: "active",
    progressPercentage: 22,
    notes: "Commercial office space development",
  },
  {
    name: "Heritage Villa Restoration",
    clientName: "Mr. Vikram Singh",
    startDate: new Date("2025-04-15"),
    endDate: new Date("2025-11-30"),
    budget: 15000000,
    address: "Jaipur, Rajasthan",
    status: "active",
    progressPercentage: 35,
    notes: "Restoration of heritage property",
  },
  {
    name: "Modern Bungalow",
    clientName: "Ms. Anjali Mehta",
    startDate: new Date("2025-05-01"),
    endDate: new Date("2025-12-31"),
    budget: 12000000,
    address: "Pune, Maharashtra",
    status: "pending",
    progressPercentage: 5,
    notes: "Contemporary bungalow design",
  },
  {
    name: "Warehouse Complex",
    clientName: "Mr. Suresh Patel",
    startDate: new Date("2024-09-15"),
    endDate: new Date("2025-08-31"),
    budget: 30000000,
    address: "Gurgaon, Haryana",
    status: "active",
    progressPercentage: 78,
    notes: "Industrial warehouse facility",
  },
  {
    name: "Luxury Apartments",
    clientName: "Ms. Meera Iyer",
    startDate: new Date("2025-06-01"),
    endDate: new Date("2026-12-31"),
    budget: 90000000,
    address: "Koramangala, Bangalore, Karnataka",
    status: "pending",
    progressPercentage: 8,
    notes: "Premium residential apartments",
  },
  {
    name: "Shopping Mall Development",
    clientName: "Mr. Rohit Desai",
    startDate: new Date("2024-12-01"),
    endDate: new Date("2026-05-31"),
    budget: 120000000,
    address: "Vashi, Navi Mumbai, Maharashtra",
    status: "active",
    progressPercentage: 42,
    notes: "Multi-level shopping and entertainment complex",
  },
  {
    name: "School Building Expansion",
    clientName: "Ms. Neha Gupta",
    startDate: new Date("2025-07-01"),
    endDate: new Date("2026-06-30"),
    budget: 18000000,
    address: "Dwarka, Delhi",
    status: "pending",
    progressPercentage: 12,
    notes: "School infrastructure expansion project",
  },
];

// Sample Workers Data
const sampleWorkers = [
  {
    name: "Ramesh Kumar",
    contact: { phone: "9876543210", email: "ramesh.kumar@email.com" },
    emergencyContact: { name: "Laxmi Devi", phone: "9876543201", relation: "Wife" },
    skillType: "Mason",
    skills: ["Mason", "Plastering"],
    experience: { years: 12 },
    joiningDate: new Date("2024-01-15"),
    wages: { dailyWage: 800, hourlyRate: 100, contractType: "Permanent" },
    status: "Active",
    documents: {
      idProof: { type: "Aadhaar", number: "123456789012", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: new Date("2026-12-31"), status: "valid" },
      medical: { expiryDate: new Date("2026-06-30"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Experienced mason, excellent work quality",
  },
  {
    name: "Suresh Yadav",
    contact: { phone: "9876543211", email: "suresh.yadav@email.com" },
    emergencyContact: { name: "Geeta Yadav", phone: "9876543202", relation: "Wife" },
    skillType: "Electrician",
    skills: ["Electrician", "Wiring"],
    experience: { years: 8 },
    joiningDate: new Date("2024-02-01"),
    wages: { dailyWage: 1000, hourlyRate: 125, contractType: "Permanent" },
    status: "Active",
    documents: {
      idProof: { type: "Aadhaar", number: "234567890123", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: new Date("2027-03-31"), status: "valid" },
      medical: { expiryDate: new Date("2026-09-30"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Licensed electrician, specializes in residential wiring",
  },
  {
    name: "Amit Patel",
    contact: { phone: "9876543212", email: "amit.patel@email.com" },
    emergencyContact: { name: "Rekha Patel", phone: "9876543203", relation: "Sister" },
    skillType: "Plumber",
    skills: ["Plumber", "Pipe Fitting"],
    experience: { years: 10 },
    joiningDate: new Date("2024-01-20"),
    wages: { dailyWage: 900, hourlyRate: 112, contractType: "Contract" },
    status: "Active",
    documents: {
      idProof: { type: "Aadhaar", number: "345678901234", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: new Date("2026-08-31"), status: "valid" },
      medical: { expiryDate: new Date("2026-07-31"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Expert in modern plumbing systems",
  },
  {
    name: "Rajesh Singh",
    contact: { phone: "9876543213", email: "rajesh.singh@email.com" },
    emergencyContact: { name: "Kamla Singh", phone: "9876543204", relation: "Wife" },
    skillType: "Welder",
    skills: ["Welder", "Fabrication"],
    experience: { years: 7 },
    joiningDate: new Date("2024-03-01"),
    wages: { dailyWage: 950, hourlyRate: 118, contractType: "Permanent" },
    status: "Active",
    documents: {
      idProof: { type: "PAN", number: "ABCDE1234F", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: new Date("2027-01-31"), status: "valid" },
      medical: { expiryDate: new Date("2026-10-31"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Expert in steel welding and fabrication",
  },
  {
    name: "Vikram Sharma",
    contact: { phone: "9876543214", email: "vikram.sharma@email.com" },
    emergencyContact: { name: "Sunita Sharma", phone: "9876543205", relation: "Wife" },
    skillType: "Carpenter",
    skills: ["Carpenter", "Furniture Making"],
    experience: { years: 15 },
    joiningDate: new Date("2023-12-01"),
    wages: { dailyWage: 1100, hourlyRate: 137, contractType: "Permanent" },
    status: "Active",
    documents: {
      idProof: { type: "Aadhaar", number: "456789012345", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: new Date("2026-11-30"), status: "valid" },
      medical: { expiryDate: new Date("2026-08-31"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Master carpenter with 15 years experience",
  },
  {
    name: "Manoj Kumar",
    contact: { phone: "9876543215", email: "manoj.kumar@email.com" },
    emergencyContact: { name: "Pushpa Devi", phone: "9876543206", relation: "Mother" },
    skillType: "Painter",
    skills: ["Painter", "Wall Finishing"],
    experience: { years: 9 },
    joiningDate: new Date("2024-04-01"),
    wages: { dailyWage: 750, hourlyRate: 93, contractType: "Contract" },
    status: "Active",
    documents: {
      idProof: { type: "Aadhaar", number: "567890123456", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: new Date("2026-09-30"), status: "valid" },
      medical: { expiryDate: new Date("2026-05-31"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Specializes in interior and exterior painting",
  },
  {
    name: "Kiran Mehta",
    contact: { phone: "9876543216", email: "kiran.mehta@email.com" },
    emergencyContact: { name: "Anil Mehta", phone: "9876543207", relation: "Brother" },
    skillType: "Laborer",
    skills: ["Laborer", "Loading", "Unloading"],
    experience: { years: 5 },
    joiningDate: new Date("2024-05-01"),
    wages: { dailyWage: 600, hourlyRate: 75, contractType: "Contract" },
    status: "Active",
    documents: {
      idProof: { type: "Aadhaar", number: "678901234567", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: null, status: "pending" },
      medical: { expiryDate: new Date("2026-04-30"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Hardworking laborer, reliable",
  },
  {
    name: "Pradeep Reddy",
    contact: { phone: "9876543217", email: "pradeep.reddy@email.com" },
    emergencyContact: { name: "Lakshmi Reddy", phone: "9876543208", relation: "Wife" },
    skillType: "Supervisor",
    skills: ["Supervisor", "Site Management"],
    experience: { years: 18 },
    joiningDate: new Date("2023-11-01"),
    wages: { dailyWage: 1500, hourlyRate: 187, contractType: "Permanent" },
    status: "Active",
    documents: {
      idProof: { type: "Aadhaar", number: "789012345678", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: new Date("2027-05-31"), status: "valid" },
      medical: { expiryDate: new Date("2026-12-31"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Senior supervisor, manages multiple projects",
  },
  {
    name: "Arjun Nair",
    contact: { phone: "9876543218", email: "arjun.nair@email.com" },
    emergencyContact: { name: "Sita Nair", phone: "9876543209", relation: "Wife" },
    skillType: "Engineer",
    skills: ["Engineer", "Construction Planning"],
    experience: { years: 6 },
    joiningDate: new Date("2024-06-01"),
    wages: { dailyWage: 2000, hourlyRate: 250, contractType: "Permanent" },
    status: "Active",
    documents: {
      idProof: { type: "PAN", number: "FGHIJ5678K", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: new Date("2028-06-30"), status: "valid" },
      medical: { expiryDate: new Date("2027-01-31"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Civil engineer with project management expertise",
  },
  {
    name: "Deepak Verma",
    contact: { phone: "9876543219", email: "deepak.verma@email.com" },
    emergencyContact: { name: "Rani Verma", phone: "9876543210", relation: "Wife" },
    skillType: "Mason",
    skills: ["Mason", "Tiling"],
    experience: { years: 11 },
    joiningDate: new Date("2024-02-15"),
    wages: { dailyWage: 850, hourlyRate: 106, contractType: "Contract" },
    status: "Active",
    documents: {
      idProof: { type: "Aadhaar", number: "890123456789", expiryDate: null, status: "valid" },
      skillCert: { expiryDate: new Date("2026-10-31"), status: "valid" },
      medical: { expiryDate: new Date("2026-09-30"), status: "valid" },
      background: { status: "verified" },
    },
    notes: "Specializes in tile work and masonry",
  },
];

async function insertSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // 1. Insert Suppliers
    console.log("\n📦 Inserting Suppliers...");
    const suppliers = [];
    for (const supplierData of sampleSuppliers) {
      let supplier = await Supplier.findOne({ name: supplierData.name });
      if (!supplier) {
        supplier = await Supplier.create(supplierData);
        console.log(`✅ Created supplier: ${supplier.name}`);
      } else {
        console.log(`⚠️  Supplier already exists: ${supplier.name}`);
      }
      suppliers.push(supplier);
    }

    // 2. Insert Materials (linked to suppliers)
    console.log("\n🧱 Inserting Materials...");
    const materials = [];
    for (let i = 0; i < sampleMaterials.length; i++) {
      const materialData = {
        ...sampleMaterials[i],
        supplier: suppliers[i % suppliers.length]._id, // Distribute materials across suppliers
      };
      let material = await Material.findOne({ name: materialData.name });
      if (!material) {
        material = await Material.create(materialData);
        console.log(`✅ Created material: ${material.name}`);
      } else {
        console.log(`⚠️  Material already exists: ${material.name}`);
      }
      materials.push(material);
    }

    // 3. Insert Projects
    console.log("\n🏗️  Inserting Projects...");
    const projects = [];
    for (const projectData of sampleProjects) {
      // Add sample milestones
      const milestones = [
        {
          title: "Foundation",
          description: "Foundation and base structure",
          weight: 20,
          status: projectData.progressPercentage > 20 ? "completed" : projectData.progressPercentage > 10 ? "in_progress" : "pending",
          dueDate: new Date(projectData.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Structure",
          description: "Main building structure",
          weight: 30,
          status: projectData.progressPercentage > 50 ? "completed" : projectData.progressPercentage > 30 ? "in_progress" : "pending",
          dueDate: new Date(projectData.startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Wiring & Plumbing",
          description: "Electrical and plumbing work",
          weight: 15,
          status: projectData.progressPercentage > 65 ? "completed" : projectData.progressPercentage > 50 ? "in_progress" : "pending",
          dueDate: new Date(projectData.startDate.getTime() + 120 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Interior Work",
          description: "Interior finishing and painting",
          weight: 20,
          status: projectData.progressPercentage > 85 ? "completed" : projectData.progressPercentage > 65 ? "in_progress" : "pending",
          dueDate: new Date(projectData.startDate.getTime() + 180 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Final Inspection",
          description: "Quality check and handover",
          weight: 15,
          status: projectData.progressPercentage > 95 ? "completed" : "pending",
          dueDate: projectData.endDate,
        },
      ];

      // Link some materials to projects
      const materialsRequired = materials.slice(0, 5).map((material) => ({
        materialId: material._id,
        quantity: Math.floor(Math.random() * 100) + 50,
        unit: material.unit,
      }));

      const projectWithData = {
        ...projectData,
        milestones,
        materialsRequired,
      };

      let project = await Project.findOne({ name: projectData.name });
      if (!project) {
        project = await Project.create(projectWithData);
        console.log(`✅ Created project: ${project.name}`);
      } else {
        console.log(`⚠️  Project already exists: ${projectData.name}`);
      }
      projects.push(project);
    }

    // 4. Insert Workers
    console.log("\n👷 Inserting Workers...");
    const workers = [];
    for (let i = 0; i < sampleWorkers.length; i++) {
      const workerData = sampleWorkers[i];
      
      // Check if worker with same phone exists
      let worker = await Worker.findOne({ "contact.phone": workerData.contact.phone });
      if (worker) {
        console.log(`⚠️  Worker already exists: ${workerData.name}`);
        workers.push(worker);
        continue;
      }

      // Assign workers to projects
      const randomProject = projects[Math.floor(Math.random() * projects.length)];
      
      // Skip documents for now - they can be added later through the UI
      // The schema seems to have issues with nested documents in bulk insertion

      // Generate workerId first (since it's required)
      const existingCount = await Worker.countDocuments();
      const workerId = `WRK${String(existingCount + 1).padStart(5, "0")}`;

      const workerWithProject = {
        workerId: workerId,
        name: workerData.name,
        photo: workerData.photo || null,
        contact: workerData.contact,
        emergencyContact: workerData.emergencyContact || {},
        skillType: workerData.skillType,
        skills: workerData.skills || [],
        experience: workerData.experience || { years: 0 },
        joiningDate: workerData.joiningDate,
        documents: {},
        assignedProject: {
          projectId: randomProject._id,
          projectName: randomProject.name,
          site: `${randomProject.address} - Site A`,
          assignedDate: new Date(),
        },
        wages: workerData.wages || { dailyWage: 0, hourlyRate: 0, contractType: "Contract" },
        status: workerData.status || "Active",
        totalDaysWorked: Math.floor(Math.random() * 30) + 10,
        attendance: {
          todayStatus: Math.random() > 0.2 ? "Present" : "Absent",
          lastAttendanceDate: new Date(),
        },
        notes: workerData.notes || "",
      };

      // Create worker
      try {
        worker = await Worker.create(workerWithProject);
        console.log(`✅ Created worker: ${worker.name} (${worker.workerId})`);
        workers.push(worker);
      } catch (error) {
        console.error(`❌ Error creating worker ${workerData.name}:`, error.message);
        if (error.errors) {
          console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
        }
      }
    }

    // 5. Insert Expenses (Material, Labor, Supplier)
    console.log("\n💰 Inserting Expenses...");
    const today = new Date();
    
    // Material expenses
    for (let i = 0; i < 15; i++) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      const project = projects[Math.floor(Math.random() * projects.length)];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      const quantity = Math.floor(Math.random() * 50) + 10;
      const unitPrice = material.unitPrice;
      const amount = quantity * unitPrice;

      const expense = await Expense.create({
        type: "material",
        projectId: project._id,
        category: "Construction Materials",
        description: `Purchased ${quantity} ${material.unit} of ${material.name}`,
        amount: amount,
        quantity: quantity,
        unit: material.unit,
        unitPrice: unitPrice,
        materialId: material._id,
        supplierId: supplier._id,
        date: new Date(today.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        paymentStatus: Math.random() > 0.3 ? "paid" : "pending",
        paidAmount: Math.random() > 0.3 ? amount : amount * 0.5,
        invoiceNumber: `INV-MAT-${Date.now()}-${i}`,
      });
    }
    console.log("✅ Created material expenses");

    // Labor expenses
    for (let i = 0; i < 20; i++) {
      if (workers.length === 0) {
        console.log("⚠️  No workers available, skipping labor expenses");
        break;
      }
      const worker = workers[Math.floor(Math.random() * workers.length)];
      if (!worker) continue;
      
      const project = projects[Math.floor(Math.random() * projects.length)];
      
      const days = Math.floor(Math.random() * 5) + 1;
      const dailyWage = (worker.wages && worker.wages.dailyWage) ? worker.wages.dailyWage : 800;
      const amount = days * dailyWage;

      await Expense.create({
        type: "labor",
        projectId: project._id,
        category: "Labor Wages",
        description: `Payment for ${worker.name} - ${days} days work`,
        amount: amount,
        quantity: days,
        unit: "days",
        unitPrice: dailyWage,
        workerId: worker._id,
        date: new Date(today.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        paymentStatus: "paid",
        paidAmount: amount,
        invoiceNumber: `PAY-LAB-${Date.now()}-${i}`,
      });
    }
    console.log("✅ Created labor expenses");

    // Supplier expenses
    for (let i = 0; i < 10; i++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const project = projects[Math.floor(Math.random() * projects.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      
      const quantity = Math.floor(Math.random() * 100) + 20;
      const unitPrice = material.unitPrice;
      const amount = quantity * unitPrice;

      await Expense.create({
        type: "supplier",
        projectId: project._id,
        category: "Supplier Invoice",
        description: `Supplier invoice from ${supplier.name} for ${material.name}`,
        amount: amount,
        quantity: quantity,
        unit: material.unit,
        unitPrice: unitPrice,
        supplierId: supplier._id,
        materialId: material._id,
        date: new Date(today.getTime() - Math.random() * 75 * 24 * 60 * 60 * 1000),
        paymentStatus: Math.random() > 0.4 ? "paid" : Math.random() > 0.5 ? "partial" : "pending",
        paidAmount: Math.random() > 0.4 ? amount : amount * (Math.random() * 0.7 + 0.1),
        invoiceNumber: `INV-SUP-${supplier.name.toUpperCase().replace(/\s/g, "")}-${Date.now()}-${i}`,
      });
    }
    console.log("✅ Created supplier expenses");

    // 6. Insert Client Payments
    console.log("\n💳 Inserting Client Payments...");
    for (const project of projects) {
      const totalAmount = project.budget;
      const paidPercentage = Math.random() * 0.6 + 0.2; // 20-80% paid
      const paidAmount = totalAmount * paidPercentage;
      const dueAmount = totalAmount - paidAmount;

      let status = "pending";
      if (paidAmount >= totalAmount) {
        status = "paid";
      } else if (paidAmount > 0) {
        status = "partially_paid";
      }

      const payment = await Payment.create({
        projectId: project._id,
        clientName: project.clientName,
        amount: totalAmount,
        paidAmount: paidAmount,
        dueAmount: dueAmount,
        status: status,
        paymentDate: new Date(project.startDate.getTime() + Math.random() * (Date.now() - project.startDate.getTime())),
        dueDate: new Date(project.endDate),
        paymentMethod: ["bank_transfer", "cheque", "cash", "online"][Math.floor(Math.random() * 4)],
        invoiceNumber: `INV-${project.name.toUpperCase().replace(/\s/g, "")}-${Date.now()}`,
        notes: `Payment for ${project.name} project`,
      });
      console.log(`✅ Created payment for ${project.name}: ${status}`);
    }

    console.log("\n✅ Sample data insertion completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Suppliers: ${suppliers.length}`);
    console.log(`   - Materials: ${materials.length}`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Workers: ${workers.length}`);
    console.log(`   - Expenses: Created`);
    console.log(`   - Payments: Created`);

    // Emit socket events to trigger real-time updates (optional - only if you have socket connection)
    console.log("\n🔄 Data is now available and will appear in real-time when you access the dashboards!");

    // Close connection
    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

insertSampleData();

