const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DisputeSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dispute', DisputeSchema);
