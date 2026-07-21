const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pointsService = require('../services/pointsService');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'devcollab_v2_secret_key_12345', {
    expiresIn: '30d',
  });
};

const signup = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is taken' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    // Award daily login points on signup
    await pointsService.addPoints(newUser, 'dailyLogin', req.io);

    const token = signToken(newUser._id);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        avatar: newUser.avatar,
        onboardingCompleted: newUser.onboardingCompleted,
        onboardingStep: newUser.onboardingStep,
        points: newUser.points,
        level: newUser.level,
        rank: newUser.rank,
        badges: newUser.badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Award daily login points
    await pointsService.addPoints(user, 'dailyLogin', req.io);

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
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

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fieldsToUpdate = [
      'name', 'bio', 'title', 'company', 'location', 'yearsOfExperience', 'skills',
      'socialLinks', 'experience', 'education', 'portfolio', 'isAvailableForHire', 'availabilityStatus', 'preferredRoles'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    // Check profile completion and add points if newly completed
    const isProfileComplete = user.bio && user.title && user.location && user.skills.length >= 3;
    const hasProfileCompleteBadge = user.badges.some(b => b.name === 'Profile Complete');

    if (isProfileComplete && !hasProfileCompleteBadge) {
      await pointsService.addPoints(user, 'completeProfile', req.io);
    }

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAnyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ message: 'Please provide avatar content' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatar = avatar;
    await user.save();
    res.json({ avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPublicPortfolio = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User portfolio not found' });
    }

    if (user.isPublic === false) {
      return res.status(403).json({ message: 'This developer portfolio is set to private' });
    }

    const Project = require('../models/Project');
    const completedProjectCount = await Project.countDocuments({
      $or: [{ ownerId: user._id }, { members: user._id }],
      status: 'completed'
    });

    res.json({
      ...user.toObject(),
      completedProjectCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateVisibility = async (req, res) => {
  try {
    const { isPublic } = req.body;
    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({ message: 'isPublic boolean parameter required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isPublic = isPublic;
    await user.save();
    res.json({ isPublic: user.isPublic, message: `Portfolio visibility set to ${isPublic ? 'Public' : 'Private'}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  getAnyProfile,
  uploadAvatar,
  getPublicPortfolio,
  updateVisibility
};
