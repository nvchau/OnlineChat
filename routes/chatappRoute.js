var express = require('express');
var router = express.Router();

var chatapp_controller = require('../controllers/chatapp.controller');
var home_controller = require('../controllers/home.controller');
var passport = require('../config/passport');

router.get('/', passport.isLoggedIn, chatapp_controller.home);
// text and emoji chat
router.post('/message/add-new-text-emoji', passport.isLoggedIn, chatapp_controller.addNewTextEmoji);
// image chat (ajax)
router.post('/message/add-new-image', passport.isLoggedIn, chatapp_controller.addNewImage);
// searh ajax
router.get('/search-user/:keywork', passport.isLoggedIn, chatapp_controller.searchUsers);

router.post('/group-chat/create-new-group', passport.isLoggedIn, chatapp_controller.createGroupChat);

module.exports = router;