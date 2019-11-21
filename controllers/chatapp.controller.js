var Member    = require('../models/member');
var Group     = require('../models/groupchat');
var Messages  = require('../models/messages');

// import {lastItemOfArray, convertTimestampToHumanTime} from '../helper/clientHelper';

exports.home = (req, res, next) => {
    // console.log(req.session.user._id)
    
    Member.find().then(member => { //{ _id: req.session.user._id }
        Group.find().then(group => {
            Messages.find().sort({createdAt: 1}).then(messages => { //.sort({createdAt: 1}): sắp xếp theo thời gian
                res.render('frontend/chatapp/home', {
                    pageTitle: 'WebChat',
                    member   : member,
                    group    : group,
                    messages : messages
                })
            })
        })
    })
    .catch(err => console.log(err));
}

// gửi tin nhắn mới
exports.addNewTextEmoji = (req, res, next) => {
    try {
        // thông tin người gửi tn (người dùng hiện tại - current user)
        let sender = {
            id: req.session.user._id,
            name: req.session.user.info.firstname + ' ' + req.session.user.info.lastname,
            avatar: req.session.user.image_path
        };

        // lấy dữ liệu từ phía client truyền lên (từ file textAndEmojiChat.js)
        let receiverId = req.body.uid;
        let messagaVal = req.body.messagaVal;
        let isChatGroup = req.body.isChatGroup;

        let newMessage = new Messages();

        // kiểm tra xem chat cá nhân hay nhóm
        if (isChatGroup) {
            var conversType = 'group';

            // lấy thông tin người nhận tn thông qua id truyền từ client
            Group.findOne({_id: receiverId}).then(receiverFind => {

                let receiver = {
                    id: receiverFind._id,
                    name: receiverFind.name,
                    avatar: receiverFind.image_path
                }

                newMessage.senderId = req.session.user._id;
                newMessage.receiverId = receiverId;
                newMessage.conversationType = conversType;
                newMessage.messageType = 'text';
                newMessage.sender = sender;
                newMessage.receiver = receiver;
                newMessage.text = messagaVal;
                newMessage.createdAt = new Date();

                newMessage.save();
                return res.status(200).send({message: newMessage});
            });

        } else {
            var conversType = 'personal';

            // lấy thông tin người nhận tn thông qua id truyền từ client
            Member.findOne({_id: receiverId}).then(receiverFind => {

                let receiver = {
                    id: receiverFind._id,
                    name: receiverFind.info.firstname + ' ' + receiverFind.info.lastname,
                    avatar: receiverFind.image_path
                }

                newMessage.senderId = req.session.user._id;
                newMessage.receiverId = receiverId;
                newMessage.conversationType = conversType;
                newMessage.messageType = 'text';
                newMessage.sender = sender;
                newMessage.receiver = receiver;
                newMessage.text = messagaVal;
                newMessage.createdAt = new Date();

                newMessage.save();
                return res.status(200).send({message: newMessage});
            });
        }

    } catch (error) {
        return res.status(500).send(error);
    }

}
