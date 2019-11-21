var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var groupChatSchema = new Schema({
    name: String,
    status: String,
    user_id: String,
    image_path: String,
    members: Array,
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: null}
}, {
    timestamps: true
});

module.exports = mongoose.model('GroupChat', groupChatSchema);