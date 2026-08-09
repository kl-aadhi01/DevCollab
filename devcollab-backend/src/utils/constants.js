const POINTS = {
  completeProfile: 50,
  addSkill: 10,
  createProject: 100,
  joinProject: 50,
  createTask: 10,
  completeTask: 25,
  completeMilestone: 50,
  completeProject: 200,
  receiveReview: 20,
  collaborate: 30,
  getEndorsement: 15,
  sendInvitation: 5,
  acceptInvitation: 10,
  completeOnboarding: 25,
  dailyLogin: 5,
  enrollBootcamp: 50,
  completeWeek: 25,
  submitAssignment: 20,
  passAssignment: 30,
  completeBootcamp: 200,
  completeCapstone: 100,
  transitionToBuild: 50,
  becomeMentor: 100,
  teachStudent: 20,
  graduateStudent: 50
};

const LEVELS = [
  { level: 1, pointsRequired: 0 },
  { level: 2, pointsRequired: 100 },
  { level: 3, pointsRequired: 300 },
  { level: 4, pointsRequired: 600 },
  { level: 5, pointsRequired: 1000 },
  { level: 6, pointsRequired: 1500 },
  { level: 7, pointsRequired: 2100 },
  { level: 8, pointsRequired: 2800 },
  { level: 9, pointsRequired: 3600 },
  { level: 10, pointsRequired: 4500 }
];

const RANKS = [
  { name: 'Bronze', minPoints: 0, icon: '🥉' },
  { name: 'Silver', minPoints: 500, icon: '🥈' },
  { name: 'Gold', minPoints: 1500, icon: '🥇' },
  { name: 'Platinum', minPoints: 3000, icon: '💎' },
  { name: 'Diamond', minPoints: 5000, icon: '👑' }
];

const BADGES = {
  // Profile Badges
  'Profile Complete': { description: 'Complete all profile fields', icon: '✅' },
  'Social Connector': { description: 'Connect 3 social accounts', icon: '🔗' },
  'Skill Master': { description: 'Add 10+ skills', icon: '🎯' },
  
  // Project Badges
  'Project Creator': { description: 'Create first project', icon: '📁' },
  'Team Builder': { description: 'Build a team of 3+ members', icon: '👥' },
  'Project Completer': { description: 'Complete first project', icon: '🎉' },
  'Project Master': { description: 'Complete 5 projects', icon: '🏆' },
  
  // Collaboration Badges
  'Team Player': { description: 'Join first project', icon: '🤝' },
  'Collaborator': { description: 'Collaborate with 5 different people', icon: '🤝' },
  'Networker': { description: 'Send 10 collaboration requests', icon: '📨' },
  
  // Task Badges
  'Task Master': { description: 'Complete 10 tasks', icon: '✅' },
  'Task Champion': { description: 'Complete 50 tasks', icon: '⭐' },
  'Leader': { description: 'Lead 3 projects to completion', icon: '👔' },
  
  // Engagement Badges
  'Active Member': { description: 'Active for 7 days', icon: '🔥' },
  'Community Star': { description: 'Receive 10 positive reviews', icon: '🌟' },
  'Mentor': { description: 'Become a mentor and help others', icon: '🧠' },
  
  // Special Badges
  'Early Bird': { description: 'Join platform in first month', icon: '🐦' },
  'Dedicated': { description: 'Complete a project on time', icon: '⏰' },
  'Innovator': { description: 'Create unique project idea', icon: '💡' },
  'Rising Star': { description: 'Reach Level 5', icon: '⭐' },
  'Elite Developer': { description: 'Reach Level 10', icon: '👑' },

  // Learn Track Badges
  'First Lesson': { description: 'Complete first learning milestone', icon: '📚' },
  'Week 1 Complete': { description: 'Complete week 1 of bootcamp', icon: '📅' },
  'Halfway There': { description: 'Complete 50% of bootcamp', icon: '⚡' },
  'Bootcamp Graduate': { description: 'Complete a bootcamp', icon: '🎓' },
  'Assignment Master': { description: 'Complete all assignments in bootcamp', icon: '📝' },
  'Capstone Creator': { description: 'Complete capstone project', icon: '🚀' },
  'Ready to Build': { description: 'Transition to BUILD track', icon: '🛠️' },
  'Teacher': { description: 'Teach 10+ students', icon: '👨‍🏫' },
  'Mentor of the Year': { description: 'Teach 50+ students', icon: '🏆' }
};

const ONBOARDING_STEPS = [
  {
    step: 1,
    title: "👋 Welcome to DevCollab!",
    description: "Connect with developers and build amazing projects together.",
    fields: []
  },
  {
    step: 2,
    title: "Create Your Profile",
    description: "Add your professional title and location.",
    fields: ['title', 'location', 'bio']
  },
  {
    step: 3,
    title: "Add Your Skills",
    description: "Showcase your technical expertise. Add at least 3 skills.",
    fields: ['skills']
  },
  {
    step: 4,
    title: "Set Availability",
    description: "Let others know if you're open to collaboration.",
    fields: ['availabilityStatus', 'isAvailableForHire']
  },
  {
    step: 5,
    title: "Connect Social Links",
    description: "Add GitHub and LinkedIn to build trust.",
    fields: ['socialLinks.github', 'socialLinks.linkedin']
  },
  {
    step: 6,
    title: "Explore Projects",
    description: "Browse projects and find the perfect team to join.",
    fields: []
  },
  {
    step: 7,
    title: "🎉 You're Ready!",
    description: "Start your journey and earn badges along the way.",
    fields: []
  }
];

module.exports = {
  POINTS,
  LEVELS,
  RANKS,
  BADGES,
  ONBOARDING_STEPS
};
