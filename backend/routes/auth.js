// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.userId = decoded.id;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ✅ Test route
router.get("/test", (req, res) => res.send("Auth route works"));

// 🔹 Signup
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, name, email, password, role } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Validate role
    const validRoles = ['admin', 'engineer', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be one of: admin, engineer, customer" });
    }

    // Check if admin already exists (one-time admin signup)
    if (role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(403).json({ message: "Admin account already exists. Admin registration is disabled." });
      }
      // Validate admin name
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters long" });
      }
    } else {
      // Validate firstName and lastName for engineer/customer
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      if (firstName.trim().length < 2 || lastName.trim().length < 2) {
        return res.status(400).json({ message: "First and last names must be at least 2 characters long" });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle admin: split name into first and last name, or use provided firstName/lastName
    let finalFirstName, finalLastName;
    
    if (role === 'admin' && name) {
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      finalFirstName = nameParts[0];
      finalLastName = nameParts.slice(1).join(' ') || nameParts[0]; // If no last name, use first name
    } else if (firstName && lastName) {
      // For engineer and customer
      finalFirstName = firstName;
      finalLastName = lastName;
    } else {
      return res.status(400).json({ message: "Invalid name fields" });
    }

    const newUser = new User({
      firstName: finalFirstName,
      lastName: finalLastName,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    res.status(201).json({ message: "Signup successful ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ 
      id: user._id,
      role: user.role,
      email: user.email
    }, process.env.JWT_SECRET || "secret123", {
      expiresIn: "1h",
    });

    // If admin, show "Login successful" message, otherwise generic message
    const loginMessage = user.role === 'admin' ? "Login successful ✅" : "Login successful ✅";

    res.status(200).json({
      message: loginMessage,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        place: user.place || "",
        state: user.state || "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// 🔹 Google Login
router.post("/google-login", async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Validate role
    const validRoles = ['admin', 'engineer', 'customer'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: "Valid role is required for Google login" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user with the specified role
      user = new User({
        firstName: given_name || "NoFirstName",
        lastName: family_name || "NoLastName",
        email,
        password: "", // Since Google users don't have local passwords
        role: role,
      });

      await user.save();
    }

    const jwtToken = jwt.sign({ 
      id: user._id,
      role: user.role,
      email: user.email
    }, process.env.JWT_SECRET || "secret123", {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Google login successful ✅",
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        place: user.place || "",
        state: user.state || "",
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ message: "Invalid Google login" });
  }
});

// 🔹 Get current profile
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("firstName lastName email role place state");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

// 🔹 Update profile
router.put("/me", authMiddleware, async (req, res) => {
  const { firstName, lastName, place, state } = req.body;
  
  // Validate firstName and lastName
  if (!firstName || !lastName) {
    return res.status(400).json({ message: "First name and last name are required" });
  }
  
  if (firstName.trim().length < 2 || lastName.trim().length < 2) {
    return res.status(400).json({ message: "First and last names must be at least 2 characters long" });
  }
  
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { firstName: firstName.trim(), lastName: lastName.trim(), place: place?.trim() || "", state } },
    { new: true, runValidators: true, fields: "firstName lastName email role place state" }
  );
  res.json({ message: "Profile updated ✅", user });
});

// 🔹 Change password
router.post("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  // Validate inputs
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old password and new password are required" });
  }
  
  // Validate new password strength
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters long" });
  }
  
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.password) return res.status(400).json({ message: "Password change not available for Google login accounts" });
  
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });
  
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Password changed ✅" });
});


// 🔹 Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Skip Google login users
    if (!user.password) {
      return res.status(400).json({ message: "Password reset not available for Google login users" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"DreamDwell" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Hello ${user.firstName || ""},</p>
             <p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetUrl}">Reset Password</a>
             <p>This link will expire in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent ✅" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error during forgot password" });
  }
});

// 🔹 Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset ✅" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error during reset password" });
  }
});

export default router;
