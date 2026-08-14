const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PracticalExerciseSchema = new Schema({
  bootcampId: { type: Schema.Types.ObjectId, ref: 'Bootcamp', required: true },
  week: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  instructions: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  estimatedTime: { type: Number, default: 0 }, // Estimated minutes
  expectedOutput: { type: String },
  submissionType: { type: String, enum: ['text', 'link', 'github'], default: 'text' },
  evaluationCriteria: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('PracticalExercise', PracticalExerciseSchema);
