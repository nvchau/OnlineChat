// hàm này được gọi ở hàm sreenChat trog mainConfig.js
function videoChat(duvId) {
    $(`#video-chat-${duvId}`).unbind("click").on("click", function() {
        let targetId = $(this).data("chat")
        let callerName = $('#currentUserName').val();
        
        let dataToEmit = {
            listenerId: targetId, // người nghe
            callerName: callerName // người gọi
        }

        // bước 1: kiểm tra người nghe có online không
        socket.emit("caller-check-listener-online", dataToEmit);
    })
}

$(document).ready(function() {

})