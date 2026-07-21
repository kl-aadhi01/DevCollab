const User = require('../models/User');

const getDevelopers = async (req, res) => {
  try {
    const { search, skill, availability } = req.query;
    let query = { _id: { $ne: req.user.id } }; // Exclude self

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    if (skill) {
      query['skills.name'] = { $regex: skill, $options: 'i' };
    }

    if (availability) {
      query.availabilityStatus = availability;
    }

    const developers = await User.find(query).select('-password');
    res.json(developers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDeveloperProfile = async (req, res) => {
  try {
    const dev = await User.findById(req.params.id).select('-password');
    if (!dev) {
      return res.status(404).json({ message: 'Developer not found' });
    }
    res.json(dev);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites', '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const saveFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const targetDev = await User.findById(req.params.id);
    if (!targetDev) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    if (user.favorites.includes(targetDev._id)) {
      return res.status(400).json({ message: 'Developer is already favorited' });
    }

    user.favorites.push(targetDev._id);
    await user.save();

    res.json({ message: 'Developer saved to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const unsaveFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.favorites) {
      user.favorites = user.favorites.filter(id => id.toString() !== req.params.id);
      await user.save();
    }

    res.json({ message: 'Developer removed from favorites', favorites: user.favorites || [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDevelopers,
  getDeveloperProfile,
  getFavorites,
  saveFavorite,
  unsaveFavorite
};
