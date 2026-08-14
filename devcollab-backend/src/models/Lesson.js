const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
  bootcampId: { type: Schema.Types.ObjectId, ref: 'Bootcamp', required: true },
  week: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String, required: true }, // Markdown supported text
  videoUrl: { type: String },
  docUrl: { type: String },
  duration: { type: Number, default: 0 }, // Estimated minutes to study
  topics: [{ type: String }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', LessonSchema);
