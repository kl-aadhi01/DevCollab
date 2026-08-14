const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSubmissionSchema = new Schema({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submissionUrl: { type: String, required: true },
  textContent: { type: String },
  grade: { type: Number, min: 0, max: 100 },
  feedback: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'submitted', 'under-review', 'graded', 'resubmit', 'completed'], 
    default: 'submitted' 
  },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssignmentSubmission', AssignmentSubmissionSchema);
