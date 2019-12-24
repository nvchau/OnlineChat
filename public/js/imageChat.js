// hàm chuyển đổi buffer thành string base64
function bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
}

function imageChat(divId){
    $(`#image-chat-${divId}`).unbind('change').on('change', function() {
        // lấy dữ liệu file qua ajax
        let fileData = $(this).prop('files')[0];
        let math = ['image/png', 'image/jpg', 'image/jpeg'];
        let limit = 1048576 // byte = 1MB
        // kiểm loại tệp tải lên có phải ảnh không
        if ($.inArray(fileData.type, math) === -1) {
            alertify.error("Invalid file type, only jpg or png is accepted");
            $(this).val(null);
            return false;
        }
        // ảnh có quá kích cỡ hay không
        if (fileData.size > limit) {
            alertify.error("Maximum allowed photo upload is 1MB");
            $(this).val(null);
            return false;
        }

        let targetId = $(this).data("chat");

        let messageFormData = new FormData();
        messageFormData.append("my-image-chat", fileData);
        messageFormData.append("uid", targetId);

        // nếu tồn tại thẻ input có class=chat-in-group - tức đây là cuộc trò chuyện group
        if ($(this).hasClass("chat-in-group")) {
            messageFormData.append("isChatGroup", true);
        }

        $.ajax({
            url: "chatapp/message/add-new-image",
            type: "post",
            cache: false,
            contentType: false,
            processData: false,
            data: messageFormData,
            success: function(data) {
                // console.log(data.message)
                let dataToEmit = {
                    message: data.message
                }

                // let messageOfMe = $(`<div class="bubble bubble-image-file me" data-mess-id="${data.message._id}"></div>`);
                let messageOfMe = ``;

                // đẩy tin nhắn mới gửi lên phía người gửi
                if (data.isChatGroup){
                    messageOfMe = `
                        <div id="last_mess_group_image" class="bubble bubble-image-file me" data-mess-id="${data.message._id}">
                            <img class="avatar-small" src="${data.message.sender.avatar}" title="${data.message.sender.name}"
                            alt="${data.message.sender.avatar}">
                            <img src="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}"
                            class="show-image-chat" title="${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }">
                        </div>
                    `;

                    dataToEmit.groupId = targetId;

                    // cập nhật tin nhắn mới nhất lên preview
                    $(`.person[data-chat = ${divId}] .preview`).html(`${data.message.sender.name}: Sent a photo`);
                    // cập thời gian của tin nhắn mới nhất lên preview
                    $(`.person[data-chat = ${divId}] .time`).html(moment(data.message.createdAt).locale("en").fromNow());
                } else {
                    messageOfMe = `
                        <div id="last_mess_group_image" class="bubble bubble-image-file me" data-mess-id="${data.message._id}">
                            <img src="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}"
                            class="show-image-chat" title="${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }">
                        </div>
                    `;

                    // cập nhật tin nhắn mới nhất lên preview
                    $(`.person[data-chat = ${divId}] .preview`).html(`Sent a photo`);
                    // cập thời gian của tin nhắn mới nhất lên preview
                    $(`.person[data-chat = ${divId}] .time`).html(moment(data.message.createdAt).locale("en").fromNow());
                }

                // append message lên screen
                $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);

                nineScrollRight(divId); // gọi lại hàm để cuộn đến tin nhắn cuối

                // Đẩy cuộc trò chuyện lên đầu
                // $(`.person[data-chat=${divId}]`).on("change", function() {
                //     let dataToMove = $(this).parent();
                //     $(this).closest("ul").prepend(dataToMove);
                //     $(this).off("moveConversationToTheTop");
                // })
                // $(`.person[data-chat=${divId}`).trigger("moveConversationToTheTop");

                // gửi data tin nhắn lên socket server
                socket.emit("image-chat", dataToEmit);
            },
            error: function(error) {
                alertify.error(error);
            }
        });
    });
}

$(document).ready(function() {
    // lắng nghe server gửi image-chat về
    socket.on("server-send-back-data-image-chat", function(data) {
        let divId = '';
        let messageOfMe = ``;

        // đẩy tin nhắn mới gửi lên phía người gửi
        if (data.message.conversationType == 'group'){
            divId = data.groupId;
            messageOfMe = `
                <div id="last_mess_group_image" class="bubble bubble-image-file you" data-mess-id="${data.message._id}">
                    <img class="avatar-small" src="${data.message.sender.avatar}" title="${data.message.sender.name}"
                    alt="${data.message.sender.avatar}">
                    <img src="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}"
                    class="show-image-chat" title="${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }">
                </div>
            `;

            // cập nhật tin nhắn mới nhất lên preview
            $(`.person[data-chat = ${divId}] .preview`).html(`${data.message.sender.name}: Sent a photo`);
            // cập thời gian của tin nhắn mới nhất lên preview
            $(`.person[data-chat = ${divId}] .time`).html(moment(data.message.createdAt).locale("en").fromNow());
        
            $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
            nineScrollRight(divId); // gọi lại hàm để cuộn đến tin nhắn cuối
        } else {
            divId = data.message.senderId;
            messageOfMe = `
                <div id="last_mess_group_image" class="bubble bubble-image-file you" data-mess-id="${data.message._id}">
                    <img src="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}"
                    class="show-image-chat" title="${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }">
                </div>
            `;

            // cập nhật tin nhắn mới nhất lên preview
            $(`.person[data-chat = ${divId}] .preview`).html(` Sent a photo`);
            // cập thời gian của tin nhắn mới nhất lên preview
            $(`.person[data-chat = ${divId}] .time`).html(moment(data.message.createdAt).locale("en").fromNow());
        
            var currentUserId = $('#currentUserId').val();
            if (data.message.receiverId == currentUserId) {
                // append message lên screen
                $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
                nineScrollRight(divId); // gọi lại hàm để cuộn đến tin nhắn cuối
            }
        }
    })
})