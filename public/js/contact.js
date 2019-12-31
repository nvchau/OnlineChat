// lấy thông tin người dùng hiện tại
var currentUserId = $('#currentUserId').val();
var currentUserName = $('#currentUserName').val();
var currentUserEmail = $('#currentUserEmail').val();
var currentUserAvatar = $('#currentUserAvatar')[0].src;
let currentUser = {
    currentUserId: currentUserId,
    currentUserName: currentUserName,
    currentUserEmail: currentUserEmail,
    currentUserAvatar: currentUserAvatar
}

// tìm kiếm người dùng không phải là bạn bè và chưa gửi yêu cầu kết bạn trước đó
function searchUserToAddContact(element) {
    if (element.which === 13 || element.type === "click" ) {
        let keyword = $("#input-search-user-to-add-contact").val();
        // let regexKeyword = new RegExp(/^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/);

        if (!keyword.replace(/\s/g, '').length) {
            // alertify.error('No search text entered.');
            return false;
        }

        $.get(`/chatapp/search-user/${keyword}`, // gửi keyword qua params
        function(data) { // nhận lại data từ server
            // mỗi lần tìm kiếm thì làm sạch list cũ
            $('ul.contact-list').html('');

            for (var userItem of data.userListSearchToSend) {
                if (userItem) {
                    $('ul.contact-list').append(`
                        <li class="_contactList" data-uid="${userItem._id}">
                            <div class="contactPanel">
                                <div class="user-avatar">
                                    <img src="${userItem.image_path}" alt="">
                                </div>
                                <div class="user-name">
                                    <p>
                                        ${userItem.info.firstname} ${userItem.info.lastname}
                                    </p>
                                </div>
                                <br>
                                <div class="user-address">
                                    <span>&nbsp ${userItem.local.email}</span>
                                </div>
                                <div class="user-add-new-contact" data-uid="${userItem._id}">
                                    Add to contact list
                                </div>
                                <div class="user-remove-request-contact action-danger" data-uid="${userItem._id}">
                                    Cancel request
                                </div>
                            </div>
                        </li>
                    `);
                }
            }

            // thêm bạn | gọi hàm ở đây mới nhận được dữ liệu
            addContact();
            // hủy yêu cầu thêm bạn
            removeRequestContact();
        })
    }
}
// gửi yêu cầu kết bạn
function addContact() {
    $('.user-add-new-contact').bind('click', function() {
        let targetId = $(this).data('uid');
        let targetName = $(`ul.contact-list li._contactList[data-uid = ${targetId}] div.user-name p`)[0].textContent;
        let targetAvatar = $(`ul.contact-list li._contactList[data-uid = ${targetId}] div.user-avatar img`)[0].src;
        let targetEmail = $(`ul.contact-list li._contactList[data-uid = ${targetId}] div.user-address span`)[0].textContent;

        $.post('chatapp/contact/add-new', {uid: targetId}, function(data) {
            if (data.success) {
                $('#find-user').find(`div.user-add-new-contact[data-uid = ${targetId}]`).hide();
                $('#find-user').find(`div.user-remove-request-contact[data-uid = ${targetId}]`).css('display', 'inline-block');
                
                alertify.success(`Sent a friend invitation to <b>${targetName}</b>`);

                // gọi hàm cộng số lượng
                increaseRequestContactNumber("count-request-contact-sent");

                // gửi yêu cầu lên server
                socket.emit('add-new-contact', {contactId: targetId, currentUser: currentUser});

                // đẩy lên danh sách chờ
                $(`#contactsModal #request-contact-sent ul.contactList`).append(`
                    <li class="_contactList" data-uid="${targetId}">
                        <div class="contactPanel">
                            <div class="user-avatar">
                                <img src="${targetAvatar}" alt="">
                            </div>
                            <div class="user-name">
                                <p>
                                    ${targetName}
                                </p>
                            </div>
                            <br>
                            <div class="user-address">
                                <span>&nbsp ${targetEmail}</span>
                            </div>
                            <div class="user-remove-request-sent action-danger" data-uid="${targetId}">
                                Cancel request
                            </div>
                        </div>
                    </li>
                `);
            }
            // nếu đã là bạn bè hoặc đã gửi lời mời kết bạn
            if (data.contactExits) {
                alertify.error("Exists contact");
            }

            // hàm xóa yêu cầu đã gửi trong danh sách
            removeRequestContactSent();
        })
    })
}
// hủy yêu cầu kết bạn khi vừa gửi
function removeRequestContact() {
    $('.user-remove-request-contact').bind('click', function() {
        let targetId = $(this).data('uid');

        // xử dụng cú pháp delete (ajax)
        $.ajax({
            url: "/chatapp/contact/remove-request-contact",
            type: "delete",
            data: {uid: targetId},
            success: function(data) {
                $('#find-user').find(`div.user-add-new-contact[data-uid = ${targetId}]`).css('display', 'inline-block');
                $('#find-user').find(`div.user-remove-request-contact[data-uid = ${targetId}]`).hide();
                
                // gọi hàm đếm giảm số lượng | hàm ở countNotification.js
                decreaseRequestContactNumber("count-request-contact-sent");

                // gửi sự kiện hủy yêu cầu lên server
                socket.emit('remove-request-contact', {contactId: targetId, currentUserId: currentUserId});

                // xóa khỏi danh sách chờ
                $(`#contactsModal #request-contact-sent ul.contactList li[data-uid = ${targetId}]`).remove();
            }
        })
    })
}
// hủy yêu cầu kết bạn trong danh sách chờ xác nhận (người dùng gửi đi)
function removeRequestContactSent() {
    $('.user-remove-request-sent').bind('click', function() {
        let targetId = $(this).data('uid');

        // xử dụng cú pháp delete (ajax)
        $.ajax({
            url: "/chatapp/contact/remove-request-contact",
            type: "delete",
            data: {uid: targetId},
            success: function(data) {
                $('#find-user').find(`div.user-add-new-contact[data-uid = ${targetId}]`).css('display', 'inline-block');
                $('#find-user').find(`div.user-remove-request-contact[data-uid = ${targetId}]`).hide();
                
                // gọi hàm đếm giảm số lượng | hàm ở countNotification.js
                decreaseRequestContactNumber("count-request-contact-sent");

                // gửi sự kiện hủy yêu cầu lên server
                socket.emit('remove-request-contact', {contactId: targetId, currentUserId: currentUserId});

                // xóa khỏi danh sách chờ
                $(`#contactsModal #request-contact-sent ul.contactList li[data-uid = ${targetId}]`).remove();
            }
        })
    })
}

$(document).ready(function() {
    // tìm kiếm
    $('#input-search-user-to-add-contact').bind('keypress', searchUserToAddContact);
    $('#btn-search-user-to-add-contact').bind('click', searchUserToAddContact);

    // lắng nghe server gửi lời mời kết bạn về (nhận được lời mời)
    socket.on("server-send-add-new-contact", function(data) {
        // đẩy thông báo
        let notifi = `
            <div class="notif-readed-false" data-uid="${data.currentUser.currentUserId}">
                <img class="avatar-small" src="${data.currentUser.currentUserAvatar}" alt=""> 
                <strong>${data.currentUser.currentUserName}</strong> sent a friend request!
            </div>
        `;

        $(`.noti_content`).prepend(notifi); // prepend: đẩy lên đầu
        // gọi hàm tăng số lượng thông báo ở contact management
        increaseRequestContactNumber("count-request-contact-received");
        // gọi hàm tăng số lượng thông báo ở navbar
        increaseRequestNotification("noti_contact_counter", 1);
        increaseRequestNotification("noti_counter", 1);

        // đẩy lên danh sách chờ
        $(`#contactsModal #request-contact-received ul.contactList`).prepend(`
            <li class="_contactList" data-uid="${data.currentUser.currentUserId}">
                <div class="contactPanel">
                    <div class="user-avatar">
                        <img src="${data.currentUser.currentUserAvatar}" alt="">
                    </div>
                    <div class="user-name">
                        <p>
                            ${data.currentUser.currentUserName}
                        </p>
                    </div>
                    <br>
                    <div class="user-address">
                        <span>&nbsp ${data.currentUser.currentUserEmail}</span>
                    </div>
                    <div class="user-acccept-contact-received" data-uid="${data.currentUser.currentUserId}">
                        Accept
                    </div>
                    <div class="user-reject-request-contact-received action-danger" data-uid="${data.currentUser.currentUserId}">
                        Reject
                    </div>
                </div>
            </li>
        `)
    })

    // lắng nghe hủy yêu cầu kết bạn
    socket.on("server-send-remove-request-contact", function(data) {
        // xóa thông báo yêu cầu kết bạn
        $(".noti_content").find(`div[data-uid = ${data.currentUserId}]`).remove();

        // gọi hàm giảm số lượng thông báo ở contact management
        decreaseRequestContactNumber("count-request-contact-received");
        // gọi hàm giảm số lượng thông báo ở navbar
        decreaseRequestNotification("noti_contact_counter", 1);
        decreaseRequestNotification("noti_counter", 1);

        // xóa khỏi danh sách chờ
        $(`#contactsModal #request-contact-received ul.contactList li[data-uid = ${data.currentUserId}]`).remove();
    })
})