var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    senderId: String,
    receiverId: String,
    conversationType: String,
    messageType: String,
    sender: {
        id: String,
        name: String,
        avatar: String
    },
    receiver: {
        id: String,
        name: String,
        avatar: String
    },
    text: String,
    file: {data: Buffer, contentType: String, fileName: String},
    createdAt: {type: String, default: new Date()},
    updatedAt: {type: String, default: null},
    deletedAt: {type: String, default: null}
}, {
    timestamps: true
});

// MessageSchema.static = {
//     /**
//      * get limited item one time
//      * @param {string} senderId currentUserId
//      * @param {string} receiverId 
//      * @param {number} limit 
//      */
//     getMessages(senderId, receiverId, limit) {
//         return this.find({
//             $or: [
//                 {$and: [
//                     {"senderId": senderId},
//                     {"receiverId": receiverId}
//                 ]},
//                 {$and: [
//                     {"receiverId": senderId},
//                     {"senderId": receiverId}
//                 ]}
//             ]
//         }).sort({"createdAt": -1}).limit(limit).exec();
//     }
// }

// const MESSAGE_CONVERSATION_TYPE = {
//     PERSONAL: "personal",
//     GROUP: "group"
// }

// const MESSAGE_TYPE = {
//     TEXT: "text",
//     IMAGE: "image",
//     FILE: "file"
// }

module.exports = mongoose.model('Messages', MessageSchema);

// module.exports = {
//     model: mongoose.model('Messages', MessageSchema),
//     conversationType: MESSAGE_CONVERSATION_TYPE,
//     messageType: MESSAGE_TYPE
// }