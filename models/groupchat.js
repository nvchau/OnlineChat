var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var groupChatSchema = new Schema({
    name: String,
    status: String,
    user_id: String,
    image_path: String,
    members: Array,
    createdAt: {type: String, default: new Date()},
    updatedAt: {type: String, default: null}
}, {
    timestamps: true
});

module.exports = mongoose.model('GroupChat', groupChatSchema);