import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  weight: { type: Number, required: true, min: 0, max: 100 }, // Percentage weight of this milestone
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  completedAt: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: Date,
  notes: String
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientName: String,
  startDate: Date,
  endDate: Date,
  budget: { type: Number },
  address: String,
  status: { 
    type: String, 
    enum: ['active', 'pending', 'completed'], 
    default: 'pending' 
  },
  materials: [{
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    quantity: Number
  }],
  teamMembers: [{
    engineerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    hours: Number
  }],
  materialsRequired: [{
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    quantity: Number,
    unit: String
  }],
  laborData: [{
    type: mongoose.Schema.Types.Mixed
  }],
  labors: [{
    labor: { type: mongoose.Schema.Types.ObjectId, ref: 'Labor' },
    days: Number
  }],
  isDraft: { type: Boolean, default: false },
  milestones: [MilestoneSchema],
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  autoStatusUpdateEnabled: { type: Boolean, default: true },
  lastStatusUpdate: Date,
  overheadPct: { type: Number, default: 10 },
  notes: String
}, { timestamps: true });

// Virtual: Calculate progress from milestones
ProjectSchema.virtual('calculatedProgress').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  
  const totalWeight = this.milestones.reduce((sum, m) => sum + (m.weight || 0), 0);
  if (totalWeight === 0) return 0;
  
  const completedWeight = this.milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + (m.weight || 0), 0);
  
  return Math.round((completedWeight / totalWeight) * 100);
});

// Method: Update progress from milestones
ProjectSchema.methods.updateProgressFromMilestones = function() {
  this.progressPercentage = this.calculatedProgress;
  return this.progressPercentage;
};

// Method: Check if project should be completed
ProjectSchema.methods.checkAutoCompletion = function() {
  if (!this.autoStatusUpdateEnabled) return false;
  
  if (this.progressPercentage >= 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.lastStatusUpdate = new Date();
    return true; // Indicates status changed
  }
  
  return false;
};

// Method: Check if project should become active
ProjectSchema.methods.checkAutoActivation = function() {
  if (!this.autoStatusUpdateEnabled) return false;
  if (!this.startDate) return false; // Can't activate without start date
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(this.startDate);
    
    // Validate date
    if (isNaN(startDate.getTime())) return false;
    
    startDate.setHours(0, 0, 0, 0);
    
    if (this.status === 'pending' && today >= startDate) {
      // Check if any milestone is in progress or completed
      const hasActiveMilestone = this.milestones && this.milestones.some(m => 
        m.status === 'in_progress' || m.status === 'completed'
      );
      
      if (hasActiveMilestone || today >= startDate) {
        this.status = 'active';
        this.lastStatusUpdate = new Date();
        return true; // Indicates status changed
      }
    }
  } catch (error) {
    console.error('Error in checkAutoActivation:', error);
    return false;
  }
  
  return false;
};

export default mongoose.model('Project', ProjectSchema);