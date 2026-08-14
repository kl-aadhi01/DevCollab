const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MentorProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, required: true },
  expertise: [{ type: String }],
  technologies: [{ type: String }],
  experienceSummary: { type: String },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalStudents: { type: Number, default: 0 },
  reviews: [{
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('MentorProfile', MentorProfileSchema);
