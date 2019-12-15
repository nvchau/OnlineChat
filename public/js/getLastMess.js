function getLastMessPersonal() {
    // tìm đến tất cả các div có id = last_mess ở vị trí kề vị trí cuối cùng (cuối là div typing)
    var listLastDivMess = document.querySelectorAll("#last_mess_personal:nth-last-of-type(2)");

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
    }
}

function getLastMessGroup() {
    // tìm đến tất cả các div có id = last_mess ở vị trí kề vị trí cuối cùng (cuối là div typing)
    var listLastDivMess = document.querySelectorAll("#last_mess_group:nth-last-of-type(2)");

    for(var i of listLastDivMess) {
        // console.log(i.children[0].textContent)
        // console.log(i.children[1].textContent)
        // console.log(i.children[2].textContent)
        // console.log(i.children[3].textContent)
        // console.log(i.children[4].textContent)
        
        // đẩy tin nhắn cuối cùng lên preview
        var lastMess = i.children[4].textContent + ": " + i.children[1].textContent.substring(0, 25) + "...";
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