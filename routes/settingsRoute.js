const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middleware/isLoggedIn');

const indexGetController = require('../controllers/settings/index/get');
const passwordGetController = require('../controllers/settings/password/get');
const universityGetController = require('../controllers/settings/university/get');

const indexPostController = require('../controllers/settings/index/post');
const passwordPostController = require('../controllers/settings/password/post');
const universityPostController = require('../controllers/settings/university/post');

router.get(
  '/',
    isLoggedIn,
    indexGetController
);
router.get(
  '/password',
    isLoggedIn,
    passwordGetController
);
router.get(
  '/university',
    isLoggedIn,
    universityGetController
);

router.post(
  '/',
    isLoggedIn,
    indexPostController
);
router.post(
  '/password',
    isLoggedIn,
    passwordPostController
);
router.post(
  '/university',
    isLoggedIn,
    universityPostController
);

module.exports = router;
