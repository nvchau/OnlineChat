var express = require('express');
var router = express.Router();

// Require Controllers Module
var home_controller = require('../controllers/home.controller');
var passport = require('../config/passport');

// /* GET Language English */
// router.get('/en', home_controller.lang_en);

// /* GET Language Vietnamese */
// router.get('/vi', home_controller.lang_vi);

/* GET home page. */
// router.get('/', home_controller.index);
router.get('/', passport.notLoggedIn, home_controller.login);

router.get('/login', passport.notLoggedIn, home_controller.login);
router.post('/login', home_controller.postLogin);

router.get('/logout', passport.isLoggedIn, home_controller.getLogout);

router.get('/register', passport.notLoggedIn, home_controller.register);
router.post('/register', passport.notLoggedIn, home_controller.postRegister);

router.get('/profile', passport.isLoggedIn, home_controller.profile);

module.exports = router;