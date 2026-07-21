const cron = require('node-cron');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

const checkInactivity = async (io) => {
  try {
    const INACTIVITY_THRESHOLD_DAYS = 7;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - INACTIVITY_THRESHOLD_DAYS);

    const activeProjects = await Project.find({ status: 'active' }).populate('members ownerId');

    for (const project of activeProjects) {
      if (!project.memberActivity || project.memberActivity.length === 0) continue;

      for (const activity of project.memberActivity) {
        if (activity.lastActivityAt < thresholdDate && activity.userId.toString() !== project.ownerId._id.toString()) {
          // Check if notification already sent recently
          const existingNotif = await Notification.findOne({
            userId: project.ownerId._id,
            category: 'inactivity',
            message: { $regex: project.name }
          });

          if (!existingNotif) {
            const notif = new Notification({
              userId: project.ownerId._id,
              message: `⚠️ Member activity warning: A developer has been inactive for over 7 days in project "${project.name}".`,
              type: 'warning',
              category: 'inactivity',
              priority: 'high',
              link: `/projects/${project._id}`
            });
            await notif.save();

            if (io) {
              io.to(project.ownerId._id.toString()).emit('notification', notif);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[Cron] Error checking member inactivity:', error.message);
  }
};

const initInactivityCron = (io) => {
  // Schedule to run daily at 01:00 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('[Cron] Running member inactivity check...');
    await checkInactivity(io);
  });
  console.log('[Cron] Member inactivity detection cron job initialized.');
};

module.exports = {
  initInactivityCron,
  checkInactivity
};
