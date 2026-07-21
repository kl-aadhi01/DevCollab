const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const auth = require('../middleware/auth');

router.get('/developers', auth, marketplaceController.getDevelopers);
router.get('/developers/:id', auth, marketplaceController.getDeveloperProfile);
router.get('/favorites', auth, marketplaceController.getFavorites);
router.post('/favorites/:id', auth, marketplaceController.saveFavorite);
router.delete('/favorites/:id', auth, marketplaceController.unsaveFavorite);

module.exports = router;
