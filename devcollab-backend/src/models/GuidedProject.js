const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuidedProjectSchema = new Schema({
  bootcampId: { type: Schema.Types.ObjectId, ref: 'Bootcamp', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  objective: { type: String },
  requiredSkills: [{ type: String }],
  requirements: [{ type: String }],
  suggestedTech: [{ type: String }],
  milestones: [{
    title: { type: String, required: true },
    description: { type: String }
  }],
  expectedDeliverables: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('GuidedProject', GuidedProjectSchema);
