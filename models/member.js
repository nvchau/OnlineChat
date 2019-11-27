var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
    info: {
        firstname: String,
        lastname: String
    },
    local: { // Use local
        email: String,
        password: String
    },
    image_path: String,
    roles: String, //ADMIN, MOD, MEMBER, VIP
    status: String, //ACTIVE, INACTIVE, SUSPENDED
    createdAt: {type: String, default: new Date()},
    updatedAt: {type: String, default: null}
}, {
    timestamps: true
});

// trả về toàn bộ thông tin của user
// findUserbyIDtoUpdate(id) {
//     return this.findById(id).exec();
// }

// Mã hóa mật khẩu
memberSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

// Giải mã mật khẩu
memberSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
}

// Valid Pincode
memberSchema.methods.validPincode = function(pincode) {
    return bcrypt.compareSync(pincode, this.local.adminPin);
}

// Valid Pincode
memberSchema.methods.isGroupAdmin = function(checkRole) {
    if (checkRole === "ADMIN") {
        return true;
    } else {
        return false;
    }
}

memberSchema.methods.isInActivated = function(checkStatus) {
    if (checkStatus === "INACTIVE") {
        return true;
    } else {
        return false;
    }
};

memberSchema.methods.isSuspended = function(checkStatus) {
    if (checkStatus === "SUSPENDED") {
        return true;
    } else {
        return false;
    }
};

module.exports = mongoose.model('Member', memberSchema);