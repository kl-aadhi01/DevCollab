const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CollaborationRequestSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  message: { type: String, required: true },
  proposedRole: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
  respondedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('CollaborationRequest', CollaborationRequestSchema);
