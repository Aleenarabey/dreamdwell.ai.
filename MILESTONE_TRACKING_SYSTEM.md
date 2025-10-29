# Milestone Tracking & Auto-Progress System

## 🎯 Overview
This system automatically tracks project progress through milestones, calculates progress percentages based on milestone completion weights, and automatically updates project status from Pending → Active → Completed.

## 🔄 Automatic Workflow

### 1. **Pending → Active**
Automatically triggers when:
- Current date >= project start date, **OR**
- First milestone is marked as "in_progress" or "completed"

### 2. **Progress Calculation**
Progress is automatically calculated from milestones:
```
Progress = (Sum of completed milestone weights / Total of all milestone weights) × 100
```

### 3. **Active → Completed**
Automatically triggers when:
- Progress reaches 100% (all milestones completed)
- Admin receives notification: "Project X has been automatically marked as completed!"

## 📊 Milestone System

### Milestone Properties
Each milestone has:
- **Title** (required)
- **Description**
- **Weight** (0-100%, required) - Percentage contribution to project progress
- **Status** - `pending` | `in_progress` | `completed`
- **Due Date** (optional)
- **Assigned To** (optional - can link to engineer)
- **Notes** (optional)
- **Completed At** - Auto-set when status becomes 'completed'

### Milestone Statuses
1. **Pending** - Not yet started
2. **In Progress** - Work has started
3. **Completed** - Finished, contributes to progress calculation

## 🎛️ API Endpoints

### Project Management
```
GET    /api/projects              # Get all projects (auto-updates status)
GET    /api/projects/:id          # Get single project (auto-updates status)
POST   /api/projects              # Create new project
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
```

### Milestone Management
```
POST   /api/projects/:id/milestones                 # Add milestone to project
PATCH  /api/projects/:id/milestones/:milestoneId    # Update milestone status
PUT    /api/projects/:id/milestones/:milestoneId    # Edit milestone details
DELETE /api/projects/:id/milestones/:milestoneId    # Delete milestone
```

### Status & Progress
```
POST   /api/projects/:id/auto-update-status         # Manually trigger auto-update
GET    /api/projects/:id/progress                   # Get progress report
```

## 💡 Usage Examples

### Example 1: Create Project with Milestones
```javascript
// Create project
POST /api/projects
{
  "name": "Office Building Construction",
  "clientName": "ABC Corp",
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "status": "pending"
}

// Add milestones with weights
POST /api/projects/PROJECT_ID/milestones
{
  "title": "Site Setup",
  "description": "Prepare construction site",
  "weight": 10  // 10% of project
}

POST /api/projects/PROJECT_ID/milestones
{
  "title": "Material Delivery",
  "description": "Receive all construction materials",
  "weight": 15  // 15% of project
}

POST /api/projects/PROJECT_ID/milestones
{
  "title": "Construction 50%",
  "description": "Complete half of construction",
  "weight": 50  // 50% of project
}

POST /api/projects/PROJECT_ID/milestones
{
  "title": "Final Inspection",
  "description": "Quality check and approval",
  "weight": 25  // 25% of project
}
```

### Example 2: Workflow
```
1. Project starts with status "pending"
2. On start date, status auto-changes to "active"
3. Admin updates milestones as work progresses:
   - Site Setup: pending → in_progress → completed (10%)
   - Material Delivery: completed (15%)
   - Construction 50%: in_progress (currently working)
   
4. Progress: 25% (Site Setup 10% + Material Delivery 15%)
5. When all milestones reach "completed":
   - Progress: 100%
   - Status auto-changes to "completed"
   - Admin gets notification
```

### Example 3: Marking Milestones
```javascript
// Update milestone status
PATCH /api/projects/PROJECT_ID/milestones/MILESTONE_ID
{
  "status": "completed"
}

// Response includes notification if project auto-completes
{
  "success": true,
  "data": { /* updated project */ },
  "autoCompleted": true,
  "notification": {
    "message": "Project 'Office Building Construction' has been automatically marked as completed!",
    "type": "success"
  }
}
```

## 🔧 Frontend UI

### Project Management Page
Located at: `/admin/projects`

Features:
- ✅ Create projects
- ✅ Add/Edit/Delete milestones
- ✅ Update milestone status (pending → in_progress → completed)
- ✅ Visual progress bar
- ✅ Automatic notifications when project completes
- ✅ Search and filter by status

### Notifications
When a project auto-completes:
- Green success notification appears at the top
- Message: "Project '[name]' has been automatically marked as completed!"
- Can be dismissed by clicking X

## 📈 Progress Calculation Example

Project has 4 milestones with weights:
- Milestone 1: 10% (completed)
- Milestone 2: 15% (completed) 
- Milestone 3: 50% (in_progress)
- Milestone 4: 25% (pending)

**Current Progress**: (10 + 15) / (10 + 15 + 50 + 25) = 25%

When Milestone 3 completes: (10 + 15 + 50) / 100 = 75%

When Milestone 4 completes: 100% → **Status auto-changes to "completed"**

## ⚙️ Advanced Features

### Disable Auto-Status Updates
Admin can disable automatic status changes per project:
```javascript
PUT /api/projects/:id
{
  "autoStatusUpdateEnabled": false
}
```

### Manual Status Override
Admin can still manually change status even with auto-updates enabled.

### Status Update Tracking
- `lastStatusUpdate`: Timestamp of last automatic status change
- `autoStatusUpdateEnabled`: Toggle for automatic updates (default: true)
- `progressPercentage`: Calculated from completed milestones

## 🎨 UI Components

### Progress Bar
Shows visual representation:
```
Progress: [████████░░░░░░░░░░░] 75%
```

### Milestone Cards
Each milestone shows:
- Title and weight
- Description
- Status dropdown (pending/in_progress/completed)
- Visual indication of current status

### Stats Dashboard
- Total Projects
- Active Projects
- Pending Projects  
- Completed Projects

## 🔐 Access Control
- Admin-only access
- Automatic authentication check
- Redirects to dashboard if not admin

## 📝 Notes

### Weight Distribution
Ensure milestone weights sum to 100% for accurate progress tracking:
- Total: 100% = 100% progress
- Total: 150% = Only 66.7% progress when all complete
- Total: 80% = Maximum 80% progress

### Date Handling
- Start date auto-activates pending projects
- Due dates can be set per milestone for tracking
- Completed dates auto-set when milestone completed

### No Milestones?
Projects without milestones show 0% progress.

## 🚀 Getting Started

1. **Create a Project**:
   - Navigate to Admin Dashboard → Projects
   - Click "Create Project"
   - Fill in details

2. **Add Milestones**:
   - Click "Add Milestone" on project card
   - Enter title, description, weight
   - Milestone weights should sum to 100%

3. **Track Progress**:
   - Update milestone status as work progresses
   - Progress bar updates automatically
   - Status updates when milestones complete

4. **Automatic Completion**:
   - When all milestones marked "completed"
   - Progress reaches 100%
   - Project status changes to "completed"
   - Admin receives notification

## 🎯 Benefits

✅ **Automated Progress Tracking** - No manual calculation needed  
✅ **Real-time Updates** - Status changes as milestones complete  
✅ **Clear Visibility** - See exactly what's done and what's pending  
✅ **Accurate Reporting** - Weighted progress calculation  
✅ **Notifications** - Never miss project completion  
✅ **Flexible** - Can override automatic updates if needed  

