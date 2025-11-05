export const checkUserRole = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    
    const userData = JSON.parse(savedUser);
    return userData?.role || null;
  } catch (error) {
    console.error("Error checking user role:", error);
    return null;
  }
};

/**
 * Check if user is an interior designer
 */
export const isInteriorDesigner = () => {
  const role = checkUserRole();
  return role === "interiorDesigner" || role === "interior";
};

/**
 * Check if user is an engineer
 */
export const isEngineer = () => {
  const role = checkUserRole();
  return role === "engineer";
};

/**
 * Force redirect if user is not an interior designer
 * Returns true if redirect happened, false otherwise
 */
export const redirectIfNotInteriorDesigner = () => {
  const role = checkUserRole();
  
  console.log("🔍 Role check utility - Role:", role);
  
  if (role === "engineer") {
    console.log("🚫 Role check: Engineer detected - FORCING redirect");
    window.location.replace("/engineer-dashboard");
    return true;
  }
  
  if (role === "admin") {
    console.log("🚫 Role check: Admin detected - FORCING redirect");
    window.location.replace("/admin-dashboard");
    return true;
  }
  
  if (role === "customer") {
    console.log("🚫 Role check: Customer detected - FORCING redirect");
    window.location.replace("/customer-dashboard");
    return true;
  }
  
  if (role && role !== "interiorDesigner" && role !== "interior") {
    console.log(`🚫 Role check: Unknown role "${role}" - FORCING redirect to home`);
    window.location.replace("/");
    return true;
  }
  
  return false;
};

