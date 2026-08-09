const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: 'default-avatar.png' },
  bio: { type: String, maxlength: 500 },
  title: { type: String },
  company: { type: String },
  location: { type: String },
  yearsOfExperience: { type: Number, min: 0 },
  
  skills: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    yearsOfExperience: { type: Number },
    isVerified: { type: Boolean, default: false }
  }],
  
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String },
    technologies: [{ type: String }]
  }],
  
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false }
  }],
  
  portfolio: [{
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    githubRepo: { type: String },
    technologies: [{ type: String }],
    image: { type: String }
  }],
  
  projectsOwned: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  projectsJoined: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  
  isAvailableForHire: { type: Boolean, default: false },
  availabilityStatus: { type: String, enum: ['open', 'busy', 'not-looking'], default: 'open' },
  preferredRoles: [{ type: String }],
  
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  rank: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'], default: 'Bronze' },
  badges: [{
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }],
  
  reviews: [{
    reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now }
  }],
  
  onboardingCompleted: { type: Boolean, default: false },
  onboardingStep: { type: Number, default: 0 },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  reliabilityScore: {
    score: { type: Number, default: 0 },
    githubActivityScore: { type: Number, default: 0 },
    projectCompletionRate: { type: Number, default: 0 },
    peerRatingAvg: { type: Number, default: 5 },
    lastCalculated: { type: Date }
  },

  isPublic: { type: Boolean, default: true },
  workingStyle: [{ type: String }],
  learningTrack: {
    enrolledBootcamps: [{ 
      bootcampId: { type: Schema.Types.ObjectId, ref: 'Bootcamp' },
      enrolledAt: { type: Date, default: Date.now },
      progress: { type: Number, default: 0 },
      status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' }
    }],
    completedBootcamps: [{ type: Schema.Types.ObjectId, ref: 'Bootcamp' }],
    isMentor: { type: Boolean, default: false },
    mentorProfile: {
      bio: { type: String },
      expertise: [{ type: String }],
      rating: { type: Number, min: 0, max: 5, default: 0 },
      totalStudents: { type: Number, default: 0 }
    }
  },
  transitionStatus: {
    isEligible: { type: Boolean, default: false },
    recommendedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    transitionedAt: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
