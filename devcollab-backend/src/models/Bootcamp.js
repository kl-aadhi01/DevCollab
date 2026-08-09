const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BootcampSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data-science', 'cloud'] },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  duration: { type: String, required: true },
  prerequisites: [{ type: String }],
  curriculum: [{
    week: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    topics: [{ type: String }],
    resources: [{ 
      title: { type: String },
      url: { type: String },
      type: { type: String, enum: ['video', 'article', 'documentation', 'github'] }
    }],
    assignment: {
      title: { type: String },
      description: { type: String },
      deadline: { type: Date }
    }
  }],
  capstoneProject: {
    title: { type: String },
    description: { type: String },
    requiredSkills: [{ type: String }],
    teamSize: { type: Number, default: 4 }
  },
  enrolledStudents: [{ 
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    completedWeeks: [{ type: Number }],
    assignmentsCompleted: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],
    status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' }
  }],
  isActive: { type: Boolean, default: true },
  maxStudents: { type: Number, default: 30 },
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
