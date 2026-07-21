const initReliabilityCron = require('./reliabilityCron');
const { initInactivityCron } = require('./inactivityCron');

const initCronJobs = (io) => {
  initReliabilityCron();
  initInactivityCron(io);
};

module.exports = initCronJobs;
