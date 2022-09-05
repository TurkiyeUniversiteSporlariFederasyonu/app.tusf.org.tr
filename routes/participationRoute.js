const express = require('express');

const router = express.Router();

const isCompleted = require('../middleware/isCompleted');
const isLoggedIn = require('../middleware/isLoggedIn');

const indexGetController = require('../controllers/participation/index/get');
const oldGetController = require('../controllers/participation/old/get');

const indexPostController = require('../controllers/participation/index/post');

router.get(
  '/',
    isLoggedIn,
    isCompleted,
    indexGetController
);
router.get(
  '/old',
    isLoggedIn,
    isCompleted,
    oldGetController
);

router.post(
  '/',
    isLoggedIn,
    isCompleted,
    indexPostController
);

module.exports = router;
