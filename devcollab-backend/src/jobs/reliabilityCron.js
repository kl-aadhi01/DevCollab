const cron = require('node-cron');
const { recalculateAllUsers } = require('../services/reliabilityScoreService');

const initReliabilityCron = () => {
  // Schedule to run once every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    console.log('[Cron] Running scheduled Reliability Score recalculation...');
    await recalculateAllUsers();
  });
  console.log('[Cron] Reliability score cron job initialized.');
};

module.exports = initReliabilityCron;
