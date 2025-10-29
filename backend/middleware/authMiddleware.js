import jwt from "jsonwebtoken";

// ✅ Basic JWT Verification
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user payload {id, email, role} to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Only Architects allowed
export const verifyArchitect = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "architect") {
      return res.status(403).json({ message: "Access denied: Architects only" });
    }
    next();
  });
};

// ✅ Only Interior Designers allowed
export const verifyInterior = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "interior") {
      return res.status(403).json({ message: "Access denied: Interior Designers only" });
    }
    next();
  });
};

// ✅ Allow both Architects and Interior Designers
export const verifyArchitectOrInterior = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "architect" && req.user.role !== "interior") {
      return res.status(403).json({ message: "Access denied: Architects or Interiors only" });
    }
    next();
  });
};

// ✅ Only Admin allowed
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }
    next();
  });
};