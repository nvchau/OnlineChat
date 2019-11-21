// xử lý khi enter input nhập tin nhắn
function textAndEmojiChat(divId) {
    $('.emojionearea').unbind('keyup').on('keyup', function(element) {
        if (element.which === 13) { // bấm enter
            // lấy data-chat trong input đang được chọn
            let targetId = $(`#write-chat-${divId}`).data('chat');
            // lấy dữ liệu trong thẻ input
            let messagaVal = $(`#write-chat-${divId}`).val();

            // nếu ô input trống hoặc chỉ chứa ký tự khoảng trắng thì không trả về
            if (!targetId.replace(/\s/g, '').length || !messagaVal.replace(/\s/g, '').length) {
                alertify.error('Messages is empty!');
                return false;
            }

            let dataTextEmojiForSend = {
                uid: targetId,
                messagaVal: messagaVal
            }

            // kiểm tra nếu thẻ input là của chat nhóm thì thêm trường isChatGroup vào object dataTextEmojiForSend
            if ($(`#write-chat-${divId}`).hasClass('chat-in-group')){
                dataTextEmojiForSend.isChatGroup = true;
            }

            // console.log(targetId);
            // console.log(messagaVal);
            // console.log(dataTextEmojiForSend);

            // gửi dữ liệu lên server
            $.post('/chatapp/message/add-new-text-emoji', dataTextEmojiForSend, function(data) {
                // success
                // console.log(data.message);

                let dataToEmit = {
                    message: data.message
                }

                // step 01: handle message data before show
                let messageOfMe = $(`<div class="bubble me" data-mess-id="${data.message._id}"></div>`);
                messageOfMe.text(data.message.text);
                // let convertEmojiMessage = emojione.toImage(messageOfMe.html());
                let convertEmojiMessage = messageOfMe.html();

                if (dataTextEmojiForSend.isChatGroup){
                    let senderAvatar = `<img src="${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}" alt="${data.message.sender.name}">`;
                    let sendTime = `<span class="time-chat">${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }</span>`;
                    messageOfMe.html(`${senderAvatar} ${convertEmojiMessage}<br>${sendTime}`);
                    dataToEmit.groupId = targetId;

                } else {
                    let sendTime = `<span class="time-chat">${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }</span>`;
                    messageOfMe.html(`${convertEmojiMessage}<br>${sendTime}`);
                    dataToEmit.personalId = targetId;
                }

                // step 02: append message data to screen
                $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
                nineScrollRight(divId); // gọi lại hàm để cuộn đến tin nhắn cuối

                // step 03: remove all data in input
                $(`#write-chat-${divId}`).val('');
                $(`.right .write[data-chat=${divId}]`).find('.emojionearea-editor').text('');

                // gửi data tin nhắn lên socket server
                socket.emit("chat-text-emoji", dataToEmit);

            }).fail(function(response) {
                // errors
                console.log(response);
            });
        }
    })
}

$(document).ready(function () {
    // lắng nghe server trả về tin nhắn
    socket.on("send-back-data-chat", function (data) {  
        let divId = '';
        
        let messageOfYou = $(`<div class="bubble you" data-mess-id="${data.message._id}"></div>`);
        messageOfYou.text(data.message.text);
        let convertEmojiMessage = messageOfYou.html();

        if (data.groupId){
            let senderAvatar = `<img src="${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}" alt="${data.message.sender.name}">`;
            let sendTime = `<span class="time-chat">${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }</span>`;
            messageOfYou.html(`${senderAvatar} ${convertEmojiMessage}<br>${sendTime}`);
            divId = data.groupId;

            $(`.right .chat[data-chat=${divId}]`).append(messageOfYou);
            nineScrollRight(divId);
        } 
        
        if (data.personalId) {
            let sendTime = `<span class="time-chat">${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }</span>`;
            messageOfYou.html(`${convertEmojiMessage}<br>${sendTime}`);
            // sử dụng senderId vì: ở cient khác, sẽ hiển thị tn ở conversation của người gửi 
            divId = data.message.senderId;

            // nếu id của người nhận bằng id người đang đăng nhập thì mới hiển thị tn (người dùng ở client khác)
            var currentUser = $('#currentUserId').val();
            if (data.personalId == currentUser){
                $(`.right .chat[data-chat=${divId}]`).append(messageOfYou);
                nineScrollRight(divId);
            }
        }

        // $(`.right .chat[data-chat=${divId}]`).append(messageOfYou);
        // nineScrollRight(divId);
        // ĐANG LÀM Ở ĐÂY: LỖI - HIỂN THỊ TIN NHẮN QUÁ SOCKET CHƯA ĐÚNG

    })
})