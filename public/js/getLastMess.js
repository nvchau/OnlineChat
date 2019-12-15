function getLastMessPersonal() {
    var listLastDivMess = document.querySelectorAll("#last_mess:nth-last-of-type(2)");

    for(var i of listLastDivMess) {
        // console.log(i.children[0].textContent)
        // console.log(i.children[1].textContent)
        // console.log(i.children[2].textContent)
        
        // đẩy tin nhắn cuối cùng lên preview
        var lastMess = i.children[0].textContent.substring(0, 25) + "...";
        $(`.left .tab-content ul.people li[data-chat = ${i.children[2].textContent}] .preview`).html(lastMess);
        // đẩy thời gian của tin nhắn cuối cùng lên previre time
        var time = moment(i.children[1].textContent).locale("en").fromNow(); // moment là một module của npm
        $(`.left .tab-content ul.people li[data-chat = ${i.children[2].textContent}] .time`).html(time);

        // moment(message_item.createdAt).locale("en").fromNow()
    }
}

$(document).ready(function() {
    getLastMessPersonal();
    // phía chat ở textAndEmojiChat có gọi lại hàm này để cập nhật khi có tin nhắn mới
})