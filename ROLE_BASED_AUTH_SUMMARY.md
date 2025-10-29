# Role-Based Authentication System Implementation

## Overview
I've implemented a comprehensive role-based authentication system with three roles: **Admin**, **Engineer**, and **Customer**. The admin can only be created once (one-time signup restriction).

## What Was Implemented

### 1. Backend Changes

#### User Model (`backend/models/User.js`)
- Added role validation with enum: `['admin', 'engineer', 'customer']`
- Set default role to `'customer'`
- Added reset password fields

#### Auth Routes (`backend/routes/auth.js`)
- **Signup**: 
  - Validates role (must be admin, engineer, or customer)
  - **One-time admin restriction**: Only allows one admin account to be created
  - Returns error if trying to create admin when one already exists
- **Login**: 
  - Returns JWT token with user role information
  - Returns user details including role

#### Server (`backend/server.js`)
- Added `/api/auth` route for the new authentication system

### 2. Frontend Changes

#### Authentication Context (`src/contexts/AuthContext.jsx`)
- Manages global authentication state
- Provides `login()`, `logout()`, `isAuthenticated()`, `isAdmin()`, `isEngineer()`, `isCustomer()` functions
- Stores user data in localStorage

#### Unified Auth Page (`src/pages/AuthPage.jsx`)
- **Role Selection**: User must choose role (Admin, Engineer, or Customer) first
- **Signup Flow**: After role selection, user fills in signup form
- **Login Flow**: Direct login form
- **Restrictions**: 
  - Admin signup shows error if admin already exists
  - Only one admin account can be created

#### Role-Based Dashboards
- **Admin Dashboard** (`src/pages/AdminDashboard.jsx`):
  - Shows admin-specific features
  - User management, analytics, settings, projects overview, security, reports
  - Only accessible to admin users
  
- **Engineer Dashboard** (`src/pages/EngineerDashboard.jsx`):
  - Shows engineer-specific features
  - Projects, tasks, communication
  - Only accessible to engineer users
  
- **Customer Dashboard** (`src/pages/CustomerDashboard.jsx`):
  - Shows customer-specific features
  - My projects, progress tracking, contact engineer
  - Only accessible to customer users

#### App Router (`src/App.js`)
- Wrapped app with `AuthProvider`
- Added routes:
  - `/auth` - Login/Signup page with role selection
  - `/admin-dashboard` - Admin only
  - `/engineer-dashboard` - Engineer only
  - `/customer-dashboard` - Customer only

#### Hero Section (`src/components/HeroSection.jsx`)
- Added "Login / Sign Up" button in header
- Navigates to `/auth` page

## How to Use

### For Users

1. **Sign Up as Admin (One-time only)**:
   - Navigate to `/auth`
   - Click "Sign up"
   - Select "Admin" role
   - Fill in the form and submit
   - After signup, you'll be redirected to login page

2. **Sign Up as Engineer/Customer**:
   - Navigate to `/auth`
   - Click "Sign up"
   - Select "Engineer" or "Customer" role
   - Fill in the form and submit

3. **Login**:
   - Navigate to `/auth`
   - Click "Log in" tab
   - Enter email and password
   - You'll be redirected to your role-specific dashboard

### For Developers

#### Using Auth Context in Components
```jsx
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { user, isAdmin, logout } = useAuth();
  
  if (isAdmin()) {
    // Show admin features
  }
  
  return (
    <div>
      <p>Welcome, {user?.firstName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Protecting Routes
The dashboards already include route protection:
```jsx
useEffect(() => {
  if (!isAdmin()) {
    navigate("/");
  }
}, [isAdmin, navigate]);
```

## Key Features

✅ **One-Time Admin Creation**: Admin account can only be created once  
✅ **Role-Based Access**: Different dashboards for each role  
✅ **Automatic Redirects**: Users are redirected to their role-specific dashboard after login  
✅ **Persistent Sessions**: User state is stored in localStorage  
✅ **Role Validation**: Backend validates roles and enforces restrictions  

## API Endpoints

- `POST /api/auth/signup` - Create new user with role
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update user profile

## Database Schema

```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'engineer', 'customer']),
  place: String,
  state: String,
  profilePhoto: String,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  timestamps: true
}
```

## Testing

1. **Test Admin Signup (First Time)**:
   - Go to `/auth`
   - Select "Admin" → Sign up
   - Should succeed

2. **Test Admin Signup (Second Time)**:
   - Try to create another admin
   - Should fail with error: "Admin account already exists"

3. **Test Login**:
   - Login as admin
   - Should redirect to `/admin-dashboard`
   - Login as engineer
   - Should redirect to `/engineer-dashboard`
   - Login as customer
   - Should redirect to `/customer-dashboard`

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens include role information
- Admin creation is restricted to one-time only
- Route protection prevents unauthorized access
- User sessions are managed securely via localStorage

