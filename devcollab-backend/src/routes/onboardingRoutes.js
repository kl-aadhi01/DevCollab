const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const auth = require('../middleware/auth');

router.get('/status', auth, onboardingController.getOnboardingStatus);
router.put('/complete', auth, onboardingController.completeOnboarding);
router.put('/step', auth, onboardingController.updateOnboardingStep);

module.exports = router;
