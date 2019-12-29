var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = new Schema({
    memberId: String,
    contactId: String,
    status: {type: Boolean, default: false},
    createdAt: {type: String, default: new Date()},
    updatedAt: {type: String, default: null},
    deletedAt: {type: String, default: null}
}, {
    timestamps: true
});

module.exports = mongoose.model('Contacts', contactSchema);