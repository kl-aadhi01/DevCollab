const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const auth = require('../middleware/auth');

router.get('/repos', auth, githubController.getRepos);
router.get('/repo/:owner/:name', auth, githubController.getRepoDetails);
router.post('/link', auth, githubController.linkGithub);

module.exports = router;
