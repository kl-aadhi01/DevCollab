const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CapstoneSchema = new Schema({
  bootcampId: { type: Schema.Types.ObjectId, ref: 'Bootcamp', required: true },
  title: { type: String, required: true },
  problemStatement: { type: String, required: true },
  description: { type: String, required: true },
  objectives: [{ type: String }],
  requiredSkills: [{ type: String }],
  suggestedTech: [{ type: String }],
  requirements: [{ type: String }],
  modules: [{
    title: { type: String, required: true },
    description: { type: String }
  }],
  milestones: [{
    title: { type: String, required: true },
    description: { type: String }
  }],
  deliverables: [{ type: String }],
  teamSize: { type: Number, default: 1 }, // 1 means individual, >1 means team
  evaluationCriteria: { type: String },
  isTeamBased: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Capstone', CapstoneSchema);
