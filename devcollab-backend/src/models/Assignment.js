const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({
  bootcampId: { type: Schema.Types.ObjectId, ref: 'Bootcamp', required: true },
  week: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructions: { type: String },
  resources: [{ 
    title: { type: String },
    url: { type: String },
    type: { type: String, enum: ['video', 'article', 'documentation', 'github'] }
  }],
  deadline: { type: Date },
  evaluationCriteria: { type: String },
  submissionRequirements: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
