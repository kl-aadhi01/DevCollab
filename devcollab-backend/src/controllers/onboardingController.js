const User = require('../models/User');
const pointsService = require('../services/pointsService');

const getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('onboardingCompleted onboardingStep');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.onboardingCompleted) {
      return res.status(400).json({ message: 'Onboarding is already completed' });
    }

    user.onboardingCompleted = true;
    user.onboardingStep = 7;
    await user.save();

    await pointsService.addPoints(user, 'completeOnboarding', req.io);

    res.json({
      message: 'Onboarding completed successfully',
      user: {
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
        points: user.points,
        level: user.level,
        rank: user.rank,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOnboardingStep = async (req, res) => {
  try {
    const { step } = req.body;
    if (step === undefined) {
      return res.status(400).json({ message: 'Step number is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.onboardingStep = step;
    await user.save();

    res.json({ onboardingStep: user.onboardingStep });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getOnboardingStatus,
  completeOnboarding,
  updateOnboardingStep
};
