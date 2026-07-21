const { BADGES } = require('../utils/constants');
const Notification = require('../models/Notification');

const awardBadge = async (user, badgeName, io) => {
  // Check if user already has the badge
  const hasBadge = user.badges.some(b => b.name === badgeName);
  if (hasBadge) return false;

  const badgeDetails = BADGES[badgeName];
  if (!badgeDetails) return false;

  user.badges.push({
    name: badgeName,
    description: badgeDetails.description,
    icon: badgeDetails.icon,
    earnedAt: new Date()
  });

  // Create a notification for the user
  const notification = new Notification({
    userId: user._id,
    message: `🎉 You earned a new badge: ${badgeDetails.icon} ${badgeName}!`,
    type: 'system',
    category: 'system',
    priority: 'high',
    read: false
  });
  await notification.save();

  if (io) {
    io.to(user._id.toString()).emit('new_badge', { badgeName, badgeDetails });
    io.to(user._id.toString()).emit('notification', notification);
  }

  return true;
};

const checkAndAwardBadges = async (user, io) => {
  let updated = false;

  // 1. Profile complete (Check basic onboarding fields)
  if (user.bio && user.title && user.location && user.skills.length >= 3) {
    const earned = await awardBadge(user, 'Profile Complete', io);
    if (earned) updated = true;
  }

  // 2. Social Connector
  let socialCount = 0;
  if (user.socialLinks?.github) socialCount++;
  if (user.socialLinks?.linkedin) socialCount++;
  if (user.socialLinks?.twitter) socialCount++;
  if (user.socialLinks?.website) socialCount++;
  if (socialCount >= 3) {
    const earned = await awardBadge(user, 'Social Connector', io);
    if (earned) updated = true;
  }

  // 3. Skill Master
  if (user.skills && user.skills.length >= 10) {
    const earned = await awardBadge(user, 'Skill Master', io);
    if (earned) updated = true;
  }

  // 4. Level based badges
  if (user.level >= 5) {
    const earned = await awardBadge(user, 'Rising Star', io);
    if (earned) updated = true;
  }
  if (user.level >= 10) {
    const earned = await awardBadge(user, 'Elite Developer', io);
    if (earned) updated = true;
  }

  return updated;
};

module.exports = {
  awardBadge,
  checkAndAwardBadges
};
