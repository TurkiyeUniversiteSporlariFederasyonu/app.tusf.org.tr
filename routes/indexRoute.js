const express = require('express');

const router = express.Router();

const isCompleted = require('../middleware/isCompleted');
const isLoggedIn = require('../middleware/isLoggedIn');

const errorGetController = require('../controllers/index/error/get');
const indexGetController = require('../controllers/index/index/get');

router.get(
  '/',
    isLoggedIn,
    isCompleted,
    indexGetController
);
router.get(
  '/error',
    errorGetController
);

module.exports = router;
