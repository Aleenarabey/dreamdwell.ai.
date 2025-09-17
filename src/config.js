// Centralized frontend config for API base URLs
// Reads from environment at build time (Create React App uses REACT_APP_*)

export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";