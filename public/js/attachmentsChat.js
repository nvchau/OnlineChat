// hàm chuyển đổi buffer thành string base64
function bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
}

function attachmentsChat(divId) {
    $(`#attachments-chat-${divId}`).unbind("change").on("change", function() {
        // lấy dữ liệu file qua ajax
        let fileData = $(this).prop('files')[0];
        let limit = 4194304 // byte = 4MB

        // ảnh có quá kích cỡ hay không
        if (fileData.size > limit) {
            alertify.error("Maximum allowed attachment upload is 3MB");
            $(this).val(null);
            return false;
        }

        let targetId = $(this).data("chat");
        let isChatGroup = false;

        let messageFormData = new FormData();
        messageFormData.append("my-attachments-chat", fileData);
        messageFormData.append("uid", targetId);

        // nếu tồn tại thẻ input có class=chat-in-group - tức đây là cuộc trò chuyện group
        if ($(this).hasClass("chat-in-group")) {
            messageFormData.append("isChatGroup", true);
            isChatGroup = true;
        }

        $.ajax({
            url: "chatapp/message/add-new-attachment",
            type: "post",
            cache: false,
            contentType: false,
            processData: false,
            data: messageFormData,
            success: function(data) {
                let dataToEmit = {
                    message: data.message
                }
                let messageOfMe = $(`<div class="bubble bubble-attachments-file me" data-mess-id="${data.message._id}"></div>`);

                // đẩy tin nhắn mới gửi lên phía người gửi
                if (data.isChatGroup){
                    dataToEmit.groupId = targetId;

                    let avatar = `<img class="avatar-small" src="${data.message.sender.avatar}" title="${data.message.sender.name}"
                    alt="${data.message.sender.avatar}">`;
                    let attachmentChat =
                    `<a href="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}"
                        download="${data.message.file.fileName}" title="${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }">
                        ${data.message.file.fileName}
                    </a>`;
                    
                    messageOfMe.html(`${avatar} ${attachmentChat}`);

                    $(`.person[data-chat = ${divId}] .preview`).html(`${data.message.sender.name} Sent a attachment`);
                    $(`.person[data-chat = ${divId}] .time`).html(moment(data.message.createdAt).locale("en").fromNow());
                } else {
                    let attachmentChat =
                    `<a href="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}"
                        download="${data.message.file.fileName}" title="${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }">
                        ${data.message.file.fileName}
                    </a>`;

                    messageOfMe.html(`${attachmentChat}`);

                    $(`.person[data-chat = ${divId}] .preview`).html(`Sent a attachment`);
                    $(`.person[data-chat = ${divId}] .time`).html(moment(data.message.createdAt).locale("en").fromNow());
                }

                $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
                nineScrollRight(divId);

                // thêm vào modal
                let attachmentChatToModal =
                `<li>
                    <a href="data:${data.message.file.contentType}; base64,
                    ${bufferToBase64(data.message.file.data.data)}"
                        download="${data.message.file.fileName}">
                        ${data.message.file.fileName}
                    </a>
                </li>`;

                $(`#attachmentsModal_${divId}`).find("ul.list-attachments").append(attachmentChatToModal);

                socket.emit("attachment-chat", dataToEmit);
            },
            error: function(error) {
                alertify.error(error);
            }
        });
    })
}

$(document).ready(function() {
    socket.on("server-send-back-data-attachment-chat", function(data) {
        let divId = '';
        let messageOfMe = $(`<div class="bubble bubble-attachments-file you" data-mess-id="${data.message._id}"></div>`);

        let attachmentChatToModal =
        `<li>
            <a href="data:${data.message.file.contentType}; base64,
            ${bufferToBase64(data.message.file.data.data)}"
                download="${data.message.file.fileName}">
                ${data.message.file.fileName}
            </a>
        </li>`;

        // đẩy tin nhắn mới gửi lên phía người gửi
        if (data.message.conversationType == 'group'){
            divId = data.groupId;

            let avatar = `<img class="avatar-small" src="${data.message.sender.avatar}" title="${data.message.sender.name}"
            alt="${data.message.sender.avatar}">`;
            let attachmentChat =
            `<a href="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}"
                download="${data.message.file.fileName}" title="${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }">
                ${data.message.file.fileName}
            </a>`;
            
            messageOfMe.html(`${avatar} ${attachmentChat}`);

            $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);

            // thêm vào modal
            $(`#attachmentsModal_${divId}`).find("ul.list-attachments").append(attachmentChatToModal);

            $(`.person[data-chat = ${divId}] .preview`).html(`${data.message.sender.name} Sent a attachment`);
            $(`.person[data-chat = ${divId}] .time`).html(moment(data.message.createdAt).locale("en").fromNow());

            nineScrollRight(divId);
        } else {
            divId = data.message.senderId;
            let attachmentChat =
            `<a href="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}"
                download="${data.message.file.fileName}" title="${ moment(data.message.createdAt).locale("en").format('hh:mm:ss a, DD/MM/YYYY') }">
                ${data.message.file.fileName}
            </a>`;

            messageOfMe.html(`${attachmentChat}`);

            var currentUserId = $('#currentUserId').val();
            if (data.message.receiverId == currentUserId) {
                $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
                // thêm vào modal
                $(`#attachmentsModal_${divId}`).find("ul.list-attachments").append(attachmentChatToModal);
            }

            $(`.person[data-chat = ${divId}] .preview`).html(`Sent a attachment`);
            $(`.person[data-chat = ${divId}] .time`).html(moment(data.message.createdAt).locale("en").fromNow());

            nineScrollRight(divId);
        }
    })
})