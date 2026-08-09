const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({
  bootcampId: { type: Schema.Types.ObjectId, ref: 'Bootcamp', required: true },
  week: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  resources: [{ 
    title: { type: String },
    url: { type: String },
    type: { type: String, enum: ['video', 'article', 'documentation', 'github'] }
  }],
  submissions: [{
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    submissionUrl: { type: String },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    status: { type: String, enum: ['pending', 'graded', 'resubmit'], default: 'pending' }
  }],
  deadline: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
