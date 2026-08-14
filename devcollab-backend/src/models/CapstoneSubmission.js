const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CapstoneSubmissionSchema = new Schema({
  capstoneId: { type: Schema.Types.ObjectId, ref: 'Capstone', required: true },
  submitterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  submissionUrl: { type: String }, // Deploy URL
  repoUrl: { type: String, required: true }, // Git Repo URL
  score: { type: Number, min: 0, max: 100 },
  feedback: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'under-review', 'approved', 'resubmit', 'completed'], 
    default: 'submitted' 
  },
  devcollabProjectId: { type: Schema.Types.ObjectId, ref: 'Project' } // Linked DevCollab Project ID if converted
}, {
  timestamps: true
});

module.exports = mongoose.model('CapstoneSubmission', CapstoneSubmissionSchema);
