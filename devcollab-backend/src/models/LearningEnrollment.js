const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LearningEnrollmentSchema = new Schema({
  bootcampId: { type: Schema.Types.ObjectId, ref: 'Bootcamp', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: { 
    type: String, 
    enum: ['enrolled', 'in-progress', 'completed', 'dropped'], 
    default: 'enrolled' 
  },
  completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  completedExercises: [{ type: Schema.Types.ObjectId, ref: 'PracticalExercise' }],
  completedAssignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],
  completedGuidedProject: { type: Boolean, default: false },
  completedCapstone: { type: Boolean, default: false },
  gradeAverage: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of student enrollment in a bootcamp
LearningEnrollmentSchema.index({ bootcampId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('LearningEnrollment', LearningEnrollmentSchema);
