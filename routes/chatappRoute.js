var express = require('express');
var router = express.Router();

var chatapp_controller = require('../controllers/chatapp.controller');
var home_controller = require('../controllers/home.controller');
var passport = require('../config/passport');

router.get('/', passport.isLoggedIn, chatapp_controller.home);

router.post('/message/add-new-text-emoji', passport.isLoggedIn, chatapp_controller.addNewTextEmoji);

module.exports = router;