var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var Notifications = new Schema({
    senderId: String,
    receiverId: String,
    type: String,
    isRead: {type: Boolean, default: false},
    createdAt: {type: String, default: new Date()},
}, {
    timestamps: true
});

module.exports = mongoose.model('Notifications', Notifications);
