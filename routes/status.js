const express = require('express');
const statusController = require('../controllers/status');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/user-status', isAuth, statusController.getStatus);

router.put('/user-status', isAuth, statusController.updateStatus);

module.exports = router;