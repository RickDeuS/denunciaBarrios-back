const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/dashboardController');

router.post('/getUsersCount', dashboardController.getUsersCount);

module.exports = router;