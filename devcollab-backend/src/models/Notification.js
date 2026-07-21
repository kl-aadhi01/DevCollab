const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['invitation', 'application', 'task', 'system', 'project', 'message', 'milestone'] },
  category: { type: String, enum: ['project', 'task', 'message', 'collaboration', 'milestone', 'system'] },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  isDismissed: { type: Boolean, default: false },
  link: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
