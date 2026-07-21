const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  raterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ratedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reliability: { type: Number, min: 1, max: 5, required: true },
  codeQuality: { type: Number, min: 1, max: 5, required: true },
  communication: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rating', RatingSchema);
