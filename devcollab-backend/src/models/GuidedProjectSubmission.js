const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuidedProjectSubmissionSchema = new Schema({
  guidedProjectId: { type: Schema.Types.ObjectId, ref: 'GuidedProject', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submissionUrl: { type: String }, // Deploy link
  repoUrl: { type: String, required: true }, // GitHub repo link
  status: { 
    type: String, 
    enum: ['pending', 'under-review', 'approved', 'resubmit', 'completed'], 
    default: 'submitted' 
  },
  feedback: { type: String },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('GuidedProjectSubmission', GuidedProjectSubmissionSchema);
