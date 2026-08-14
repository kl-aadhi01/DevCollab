const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExerciseSubmissionSchema = new Schema({
  exerciseId: { type: Schema.Types.ObjectId, ref: 'PracticalExercise', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  textContent: { type: String },
  submissionUrl: { type: String }, // Can be GitHub url, output link, etc.
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  grade: { type: Number, min: 0, max: 100 },
  feedback: { type: String },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExerciseSubmission', ExerciseSubmissionSchema);
