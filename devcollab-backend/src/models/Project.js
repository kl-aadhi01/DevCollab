const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String, required: true }],
  teamSize: { type: Number, required: true },
  deadline: { type: Date, required: true },
  githubRepo: { type: String, default: '' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['planning', 'active', 'completed', 'archived'], default: 'planning' },
  
  roadmap: [{
    phase: { type: String, required: true },
    description: { type: String },
    milestones: [{
      title: { type: String, required: true },
      description: { type: String },
      targetDate: { type: Date },
      status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
      completedAt: { type: Date }
    }]
  }],
  progress: { type: Number, min: 0, max: 100, default: 0 },

  memberActivity: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    lastActivityAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
