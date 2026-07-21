const { POINTS, LEVELS, RANKS } = require('../utils/constants');
const { checkAndAwardBadges } = require('./badgeService');
const Notification = require('../models/Notification');

const addPoints = async (user, actionName, io) => {
  const pointsToAward = POINTS[actionName];
  if (!pointsToAward) return;

  user.points += pointsToAward;
  console.log(`Awarded ${pointsToAward} points to user ${user.username} for action: ${actionName}. Total points: ${user.points}`);

  // Check Level up
  let newLevel = user.level;
  for (let i = 0; i < LEVELS.length; i++) {
    if (user.points >= LEVELS[i].pointsRequired) {
      newLevel = LEVELS[i].level;
    } else {
      break;
    }
  }

  const leveledUp = newLevel > user.level;
  if (leveledUp) {
    user.level = newLevel;
    
    // Create level up notification
    const notification = new Notification({
      userId: user._id,
      message: `⚡ Congratulations! You leveled up to Level ${user.level}!`,
      type: 'system',
      category: 'system',
      priority: 'high',
      read: false
    });
    await notification.save();

    if (io) {
      io.to(user._id.toString()).emit('level_up', { level: user.level });
      io.to(user._id.toString()).emit('notification', notification);
    }
  }

  // Check Rank up
  let newRank = 'Bronze';
  for (let i = 0; i < RANKS.length; i++) {
    if (user.points >= RANKS[i].minPoints) {
      newRank = RANKS[i].name;
    } else {
      break;
    }
  }

  if (newRank !== user.rank) {
    user.rank = newRank;
    const rankInfo = RANKS.find(r => r.name === newRank);
    const notification = new Notification({
      userId: user._id,
      message: `👑 You achieved rank: ${rankInfo.icon} ${newRank}!`,
      type: 'system',
      category: 'system',
      priority: 'high',
      read: false
    });
    await notification.save();

    if (io) {
      io.to(user._id.toString()).emit('rank_up', { rank: user.rank, icon: rankInfo.icon });
      io.to(user._id.toString()).emit('notification', notification);
    }
  }

  // Check and award badges
  await checkAndAwardBadges(user, io);

  await user.save();

  if (io) {
    io.to(user._id.toString()).emit('points_update', { points: user.points, level: user.level, rank: user.rank });
  }
};

module.exports = {
  addPoints
};
