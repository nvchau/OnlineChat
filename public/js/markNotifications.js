$(document).ready(function() {
    // đánh dấu tất cả thống báo là đã đọc
    $("#popup-mark-notif-as-read").bind("click", function() {
        let targetUser = [];
        $(".noti_content").find("div.notif-readed-false").each(function(index, notification) { // each: vòng lặp trong jquery
            // tìm đến từng div có class notif-readed-false (chưa đọc - mỗi notification tương ứng 1 div) có data-uid và lấy id
            targetUser.push($(notification).data("uid")) 
        })
        
        if (!targetUser.length) {
            alertify.success("Readed all notifications!");
            return false;
        } else {
            // chuyển mảng thành JSon để gửi lên server
            let targetUserJson = JSON.stringify(targetUser);

            $.ajax({
                url: '/chatapp/notification/mark-all-as-read',
                type: 'put',
                data: {targetUserJson: targetUserJson},
                success: function(result) {
                    if (result) {
                        targetUser.forEach(uid => {
                            $(".noti_content").find(`div[data-uid = ${uid}]`).removeClass("notif-readed-false");
                        })
                        // giảm số lượng hiện trên thông báo
                        decreaseRequestNotification("noti_counter", targetUser.length);
                    }
                }
            })
        }
    })
})