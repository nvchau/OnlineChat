function getLastMessPersonal() {
    // tìm đến tất cả các div có id = last_mess_personal_text ở vị trí cuối cùng
    var listLastDivMessText = document.querySelectorAll("#last_mess_personal_text:nth-last-of-type(1)"); // kiểu text | nếu: nth-last-of-type(2) là tìm đến vị trí gần cuối
    var listLastDivMessImage = document.querySelectorAll("#last_mess_personal_image:nth-last-of-type(1)"); // kiểu hình ảnh
    var listLastDivMessFile = document.querySelectorAll("#last_mess_personal_attachment:nth-last-of-type(1)"); // kiểu tệp đính kèm

    // hiển thị text
    for(var i of listLastDivMessText) {
        // console.log(i.children[0].textContent)
        // console.log(i.children[1].textContent)
        // console.log(i.children[2].textContent)
        
        // đẩy tin nhắn cuối cùng lên preview
        var lastMess = i.children[0].textContent.substring(0, 25) + "...";
        $(`.left .tab-content ul.people li[data-chat = ${i.children[2].textContent}] .preview`).html(lastMess);
        // đẩy thời gian của tin nhắn cuối cùng lên previre time
        var time = moment(i.children[1].textContent).locale("en").fromNow(); // moment là một module của npm
        $(`.left .tab-content ul.people li[data-chat = ${i.children[2].textContent}] .time`).html(time);
    }
    // hiển thị image
    for(var i of listLastDivMessImage) {
        // đẩy tin nhắn cuối cùng lên preview
        var lastMess = `Sent a photo`;
        $(`.left .tab-content ul.people li[data-chat = ${i.children[2].textContent}] .preview`).html(lastMess);
        // đẩy thời gian của tin nhắn cuối cùng lên previre time
        var time = moment(i.children[1].textContent).locale("en").fromNow(); // moment là một module của npm
        $(`.left .tab-content ul.people li[data-chat = ${i.children[2].textContent}] .time`).html(time);
    }
    // hiển thị tệp đính kèm (attachment)
    for(var i of listLastDivMessFile) {
        // đẩy tin nhắn cuối cùng lên preview
        var lastMess = `Sent a attachment`;
        $(`.left .tab-content ul.people li[data-chat = ${i.children[2].textContent}] .preview`).html(lastMess);
        // đẩy thời gian của tin nhắn cuối cùng lên previre time
        var time = moment(i.children[1].textContent).locale("en").fromNow(); // moment là một module của npm
        $(`.left .tab-content ul.people li[data-chat = ${i.children[2].textContent}] .time`).html(time);
    }
}

function getLastMessGroup() {
    // tìm đến tất cả các div có id = last_mess ở vị trí kề vị trí cuối cùng (cuối là div typing)
    var listLastDivMessText = document.querySelectorAll("#last_mess_group_text:nth-last-of-type(1)"); // kiểu text
    var listLastDivMessImage = document.querySelectorAll("#last_mess_group_image:nth-last-of-type(1)"); // kiểu hình
    var listLastDivMessFile = document.querySelectorAll("#last_mess_group_attachment:nth-last-of-type(1)"); // kiểu tệp
    // hiển thị text
    for(var i of listLastDivMessText) {
        // console.log(i.children[0].textContent)
        // console.log(i.children[1].textContent)
        // console.log(i.children[2].textContent)
        // console.log(i.children[3].textContent)
        // console.log(i.children[4].textContent)
        
        // đẩy tin nhắn cuối cùng lên preview
        var lastMess = `<b>${i.children[4].textContent}</b>: ${i.children[1].textContent.substring(0, 25)}...`;
        $(`.left .tab-content ul.people li[data-chat = ${i.children[3].textContent}] .preview`).html(lastMess);
        // đẩy thời gian của tin nhắn cuối cùng lên previre time
        var time = moment(i.children[2].textContent).locale("en").fromNow(); // moment là một module của npm
        $(`.left .tab-content ul.people li[data-chat = ${i.children[3].textContent}] .time`).html(time);
    }
    // hiển thị image
    for(var i of listLastDivMessImage) {
        // đẩy tin nhắn cuối cùng lên preview
        var lastMess = `<b>${i.children[4].textContent}</b>: Sent a photo`;
        $(`.left .tab-content ul.people li[data-chat = ${i.children[3].textContent}] .preview`).html(lastMess);
        // đẩy thời gian của tin nhắn cuối cùng lên previre time
        var time = moment(i.children[2].textContent).locale("en").fromNow(); // moment là một module của npm
        $(`.left .tab-content ul.people li[data-chat = ${i.children[3].textContent}] .time`).html(time);
    }
    // hiển thị tệp đính kèm (attachment)
    for(var i of listLastDivMessFile) {
        // đẩy tin nhắn cuối cùng lên preview
        var lastMess = `<b>${i.children[4].textContent}</b>: Sent a attachment`;
        $(`.left .tab-content ul.people li[data-chat = ${i.children[3].textContent}] .preview`).html(lastMess);
        // đẩy thời gian của tin nhắn cuối cùng lên previre time
        var time = moment(i.children[2].textContent).locale("en").fromNow(); // moment là một module của npm
        $(`.left .tab-content ul.people li[data-chat = ${i.children[3].textContent}] .time`).html(time);
    }
}

$(document).ready(function() {
    getLastMessPersonal();
    getLastMessGroup();
})