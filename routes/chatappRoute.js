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
// attachment chat (ajax)
router.post('/message/add-new-attachment', passport.isLoggedIn, chatapp_controller.addNewAttachment);
// searh contact (friend) ajax
router.get('/search-friend/:keywork', passport.isLoggedIn, chatapp_controller.searchFriend);
// tạo group chat
router.post('/group-chat/create-new-group', passport.isLoggedIn, chatapp_controller.createGroupChat);
// searh user ajax
router.get('/search-user/:keywork', passport.isLoggedIn, chatapp_controller.searchUser);
// kết bạn (ajax) - add contact
router.post('/contact/add-new', passport.isLoggedIn, chatapp_controller.addNewContact);
// hủy yêu cầu kết bạn người dùng gửi đi (ajax) - remove request contact
router.delete('/contact/remove-request-contact-sent', passport.isLoggedIn, chatapp_controller.removeRequestContactSent);
// hủy yêu cầu kết bạn người dùng nhận được (ajax) - remove request contact
router.delete('/contact/remove-request-contact-received', passport.isLoggedIn, chatapp_controller.removeRequestContactReceived);
// chấp nhận yêu cầu kết bạn (ajax) - accept request contact
router.put('/contact/acccept-contact-received', passport.isLoggedIn, chatapp_controller.accceptRequestContactReceived);
// xóa bạn bè
router.delete('/contact/remove-contact', passport.isLoggedIn, chatapp_controller.removeContact);
// đánh dấu tất cả thông báo là đã đọc
router.put('/notification/mark-all-as-read', passport.isLoggedIn, chatapp_controller.markAllNotifiAsRead);

module.exports = router;