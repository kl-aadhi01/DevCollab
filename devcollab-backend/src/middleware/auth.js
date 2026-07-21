const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET || 'devcollab_v2_secret_key_12345');
    if (!verified) {
      return res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }

    req.user = verified; // verified payload has { id } or similar
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token, authorization denied', error: error.message });
  }
};

module.exports = auth;
