// routes/interiorAuth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import InteriorDesigner from "../models/InteriorUser.js";
import User from "../models/User.js"; // Import User model to check for engineers
import nodemailer from "nodemailer";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔑 Signup (Normal)
router.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPassword, licenseId, firstName, lastName, designerName, name, userType } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // ⚠️ CRITICAL: Check if this email belongs to an engineer in the User model
    // Engineers should NOT be able to signup through interior auth endpoint
    try {
      const engineerCheck = await User.findOne({ email, role: "engineer" });
      if (engineerCheck) {
        console.log("🚫 BLOCKED: Engineer attempted to signup through interior auth endpoint - Email:", email);
        return res.status(403).json({ 
          message: "Engineers must use the Engineer signup page. Please go to /auth to signup." 
        });
      }
    } catch (checkError) {
      console.error("Error checking for engineer in signup:", checkError);
    }

    const existingUser = await InteriorDesigner.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate based on user type
    if (userType === "admin") {
      // Admin name is optional - will use default "Admin" if not provided
    } else {
      // Validate firstName and lastName for non-admin users
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      if (firstName.trim().length < 2 || lastName.trim().length < 2) {
        return res.status(400).json({ message: "First and last names must be at least 2 characters long" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Handle admin: use name field, split into first/last for storage
    let computedDesignerName;
    let finalRole = "interiorDesigner";
    
    if (userType === "admin") {
      // For admin, use a default name if name is not provided
      computedDesignerName = name ? name.trim() : "Admin";
      finalRole = "admin";
    } else {
      computedDesignerName = designerName || [firstName, lastName].filter(Boolean).join(" ").trim();
    }

    // Only validate name for non-admin users
    if (userType !== "admin" && !computedDesignerName) {
      return res.status(400).json({ message: "Designer name is required" });
    }

    const newUser = new InteriorDesigner({
      designerName: computedDesignerName,
      email,
      password: hashedPassword,
      licenseId,
      role: finalRole,
      userType: userType, // Store the original user type
    });

    await newUser.save();
    res.json({ message: "Signup successful", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔑 Login (Normal)
router.post("/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    console.log("🔍 Interior Auth Login Attempt - Email:", email);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // ⚠️ CRITICAL: Check if this email belongs to an engineer in the User model FIRST
    // Engineers should NOT be able to login through interior auth endpoint
    try {
      const engineerCheck = await User.findOne({ email, role: "engineer" });
      if (engineerCheck) {
        console.log("🚫🚫🚫 BLOCKED: Engineer attempted to login through interior auth endpoint");
        console.log("🚫 Engineer email:", email);
        console.log("🚫 Engineer ID:", engineerCheck._id);
        return res.status(403).json({ 
          message: "Engineers must use the Engineer login page. Please go to /auth to login." 
        });
      } else {
        console.log("✅ Email", email, "is not an engineer in User model - proceeding with interior auth check");
      }
    } catch (checkError) {
      // If User model lookup fails, log but continue (don't block legitimate users)
      console.error("Error checking for engineer:", checkError);
    }

    const user = await InteriorDesigner.findOne({ email });
    if (!user) {
      console.log("❌ User not found in InteriorDesigner model for email:", email);
      return res.status(400).json({ message: "User not found" });
    }
    
    console.log("🔍 Found user in InteriorDesigner model - Role:", user.role, "Email:", user.email);

    // ⚠️ CRITICAL: Check if user's role is engineer (even if stored in InteriorDesigner model)
    // This is a safety check - engineers should never have accounts in InteriorDesigner model
    if (user.role === "engineer") {
      console.log("🚫 BLOCKED: User with engineer role found in InteriorDesigner model");
      return res.status(403).json({ 
        message: "Engineers must use the Engineer login page. Please go to /auth to login." 
      });
    }

    // Only compare password if user has a password
    if (!user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Use the user's actual role from the database
    const userRole = user.role || "interiorDesigner";
    
    // ⚠️ FINAL SAFETY CHECK: Ensure role is not engineer
    if (userRole === "engineer") {
      console.log("🚫 BLOCKED: Engineer role detected in login response");
      return res.status(403).json({ 
        message: "Engineers must use the Engineer login page. Please go to /auth to login." 
      });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      message: "Login successful", 
      token, 
      user: {
        _id: user._id,
        email: user.email,
        role: userRole,
        designerName: user.designerName,
        name: user.designerName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔑 Google Login/Signup
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Google token is required" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, given_name, family_name, sub: googleId } = payload;

    // ⚠️ CRITICAL: Check if this email belongs to an engineer in the User model
    // Engineers should NOT be able to login through interior auth endpoint
    try {
      const engineerCheck = await User.findOne({ email, role: "engineer" });
      if (engineerCheck) {
        console.log("🚫 BLOCKED: Engineer attempted Google login through interior auth endpoint - Email:", email);
        return res.status(403).json({ 
          message: "Engineers must use the Engineer login page. Please go to /auth to login." 
        });
      }
    } catch (checkError) {
      // If User model lookup fails, log but continue (don't block legitimate users)
      console.error("Error checking for engineer in Google login:", checkError);
    }

    let user = await InteriorDesigner.findOne({ email });

    if (!user) {
      // Create new Google user without password
      user = new InteriorDesigner({
        designerName: name || `${given_name || ""} ${family_name || ""}`.trim() || "Interior Designer",
        email,
        googleId,
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google ID if user exists
      user.googleId = googleId;
      await user.save();
    }

    // ⚠️ CRITICAL: Check if user's role is engineer (safety check)
    if (user.role === "engineer") {
      console.log("🚫 BLOCKED: User with engineer role found in InteriorDesigner model (Google login)");
      return res.status(403).json({ 
        message: "Engineers must use the Engineer login page. Please go to /auth to login." 
      });
    }

    // Use the user's actual role from the database
    const userRole = user.role || "interiorDesigner";
    
    // ⚠️ FINAL SAFETY CHECK: Ensure role is not engineer
    if (userRole === "engineer") {
      console.log("🚫 BLOCKED: Engineer role detected in Google login response");
      return res.status(403).json({ 
        message: "Engineers must use the Engineer login page. Please go to /auth to login." 
      });
    }
    
    const jwtToken = jwt.sign(
      { id: user._id, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Google login successful ✅",
      token: jwtToken,
      user: {
        _id: user._id,
        designerName: user.designerName,
        email: user.email,
        licenseId: user.licenseId,
        role: userRole,
      },
    });
  } catch (err) {
    console.error("Google login error (interior):", err);
    res.status(401).json({ message: "Invalid Google login" });
  }
});

// 🔑 Forgot Password


// POST /forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await InteriorDesigner.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a password reset token (15 min)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Create reset URL
    const resetUrl = `http://localhost:3000/interior-reset-password/${resetToken}`;

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "InteriorDesigner Password Reset",
      html: `
        <p>Hello ${user.designerName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to your email ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// POST /reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await InteriorDesigner.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful ✅" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
