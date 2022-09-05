const express = require('express');
const router = express.Router();

const loginGetController = require('../controllers/auth/login/get');
const logoutGetController = require('../controllers/auth/logout/get');
const passwordGetController = require('../controllers/auth/password/get');
const resetGetController = require('../controllers/auth/reset/get');

const loginPostController = require('../controllers/auth/login/post');
const passwordPostController = require('../controllers/auth/password/post');
const resetPostController = require('../controllers/auth/reset/post');

router.get(
  '/login',
    loginGetController
);
router.get(
  '/logout',
    logoutGetController
);
router.get(
  '/password',
    passwordGetController
);
router.get(
  '/reset',
    resetGetController
);

router.post(
  '/login',
    loginPostController
);
router.post(
  '/password',
    passwordPostController
);
router.post(
  '/reset',
    resetPostController
);

module.exports = router;
