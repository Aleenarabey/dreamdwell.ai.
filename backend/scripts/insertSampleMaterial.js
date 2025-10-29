import mongoose from "mongoose";
import dotenv from "dotenv";
import Material from "../models/Material.js";

dotenv.config();

const sampleMaterial = {
  name: "Cement (50kg)",
  unit: "bag",
  unitPrice: 450,
  co2PerUnit: 25,
  supplier: null, // You can add a supplier ID if you have one
  stock: 120,
  reorderLevel: 50,
  description: "UltraCement 50kg bag",
};

async function insertSampleMaterial() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Check if material already exists
    const existingMaterial = await Material.findOne({ name: sampleMaterial.name });
    if (existingMaterial) {
      console.log("⚠️  Material already exists:", existingMaterial.name);
      console.log("📋 Updating existing material...");
      const updated = await Material.findByIdAndUpdate(
        existingMaterial._id,
        sampleMaterial,
        { new: true, runValidators: true }
      );
      console.log("✅ Material updated successfully:", updated);
    } else {
      // Create new material
      const material = await Material.create(sampleMaterial);
      console.log("✅ Material created successfully:", material);
    }

    // Close connection
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

insertSampleMaterial();

