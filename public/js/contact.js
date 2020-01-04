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
                                <div class="user-remove-request-contact-sent action-danger" data-uid="${userItem._id}">
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
                $('#find-user').find(`div.user-remove-request-contact-sent[data-uid = ${targetId}]`).css('display', 'inline-block');
                
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
    $('.user-remove-request-contact-sent').unbind('click').on('click', function() {
        let targetId = $(this).data('uid');

        // xử dụng cú pháp delete (ajax)
        $.ajax({
            url: "/chatapp/contact/remove-request-contact-sent",
            type: "delete",
            data: {uid: targetId},
            success: function(data) {
                $('#find-user').find(`div.user-add-new-contact[data-uid = ${targetId}]`).css('display', 'inline-block');
                $('#find-user').find(`div.user-remove-request-contact-sent[data-uid = ${targetId}]`).hide();
                
                // gọi hàm đếm giảm số lượng | hàm ở countNotification.js
                decreaseRequestContactNumber("count-request-contact-sent");

                // gửi sự kiện hủy yêu cầu lên server
                socket.emit("remove-request-contact-sent", {contactId: targetId, currentUserId: currentUserId});

                // xóa khỏi danh sách chờ
                $(`#contactsModal #request-contact-sent ul.contactList li[data-uid = ${targetId}]`).remove();
            }
        })
    })
}
// hủy yêu cầu kết bạn trong danh sách chờ xác nhận (người dùng gửi đi)
function removeRequestContactSent() {
    $('.user-remove-request-sent').unbind('click').on('click', function() {
        let targetId = $(this).data('uid');

        // xử dụng cú pháp delete (ajax)
        $.ajax({
            url: "/chatapp/contact/remove-request-contact-sent",
            type: "delete",
            data: {uid: targetId},
            success: function(data) {
                $('#find-user').find(`div.user-add-new-contact[data-uid = ${targetId}]`).css('display', 'inline-block');
                $('#find-user').find(`div.user-remove-request-contact-sent[data-uid = ${targetId}]`).hide();
                
                // gọi hàm đếm giảm số lượng | hàm ở countNotification.js
                decreaseRequestContactNumber("count-request-contact-sent");

                // gửi sự kiện hủy yêu cầu lên server
                socket.emit("remove-request-contact-sent", {contactId: targetId, currentUserId: currentUserId});

                // xóa khỏi danh sách chờ
                $(`#contactsModal #request-contact-sent ul.contactList li[data-uid = ${targetId}]`).remove();
            }
        })
    })
}
// hủy yêu cầu kết bạn nhận được trong danh sách chờ (người dùng nhận được)
function removeRequestContactReceived() {
    $('.user-reject-request-contact-received').unbind('click').on('click', function() {
        let targetId = $(this).data('uid');

        // xử dụng cú pháp delete (ajax)
        $.ajax({
            url: "/chatapp/contact/remove-request-contact-received",
            type: "delete",
            data: {uid: targetId},
            success: function(data) {
                // gọi hàm đếm giảm số lượng | hàm ở countNotification.js
                decreaseRequestContactNumber("count-request-contact-received");
                decreaseRequestNotification("noti_contact_counter", 1);
                decreaseRequestNotification("noti_counter", 1);

                // gửi sự kiện hủy yêu cầu lên server
                socket.emit("remove-request-contact-received", {contactId: targetId, currentUserId: currentUserId});

                // xóa thông báo yêu cầu kết bạn
                $(".noti_content").find(`div[data-uid = ${targetId}]`).remove();

                // xóa khỏi danh sách chờ
                $(`#contactsModal #request-contact-received ul.contactList li[data-uid = ${targetId}]`).remove();
            }
        })
    })
}
// đồng ý kết bạn
function acceptRequestContact() {
    $(`.user-acccept-contact-received`).unbind('click').on('click', function() {
        let targetId = $(this).data('uid');

        // xử dụng cú pháp delete (ajax)
        $.ajax({
            url: "/chatapp/contact/acccept-contact-received",
            type: "put",
            data: {uid: targetId},
            success: function(data) {
                // gửi sự kiện hủy yêu cầu lên server
                let newContact = {
                    id: currentUserId,
                    name: currentUserName,
                    email: currentUserEmail,
                    avatar: currentUserAvatar
                }
                socket.emit("acccept-contact-received", { contactId: targetId, newContact: newContact });

                // chuyển thông báo yêu cầu kết bạn thành đã đọc
                $(".noti_content").find(`div[data-uid = ${targetId}]`).removeClass("notif-readed-false");

                // gọi hàm giảm thông báo ở navbar
                decreaseRequestNotification("noti_contact_counter", 1);
                decreaseRequestNotification("noti_counter", 1);

                // xóa yêu cầu kết bạn khỏi danh sách chờ
                $(`#contactsModal #request-contact-received ul.contactList li[data-uid = ${targetId}]`).remove();

                // thêm contact mới vào danh sách contact ở contact management modal
                $(`#contactsModal #contacts ul.contactList`).prepend(`
                    <li class="_contactList" data-uid="${data.newContact._id}">
                        <div class="contactPanel">
                            <div class="user-avatar">
                                <img src="${data.newContact.image_path}" alt="">
                            </div>
                            <div class="user-name">
                                <p>
                                    ${data.newContact.info.firstname} ${data.newContact.info.lastname}
                                </p>
                            </div>
                            <br>
                            <div class="user-address">
                                <span>&nbsp ${data.newContact.local.email}</span>
                            </div>
                            <div class="user-talk" data-uid="${data.newContact._id}">
                                Chatting
                            </div>
                            <div class="user-remove-contact action-danger" data-uid="${data.newContact._id}">
                                Delete contact
                            </div>
                        </div>
                    </li>
                `);

                // hiển thị contact mới lên danh sách trò chuyện - leftside
                let leftSideData = `
                    <a href="#uid_${data.newContact._id}" class="room-chat" id="null-contact" data-target="#to_${data.newContact._id}">
                        <li class="person" data-chat="${data.newContact._id}">
                            <div class="left-avatar">
                                <div class="status dot online"></div>
                                <img src="${data.newContact.image_path}" alt="">
                            </div>
                            <span class="name">
                                ${data.newContact.info.firstname} ${data.newContact.info.lastname}
                            </span><br>
                            <span class="time"></span>
                            <span class="preview"></span>
                        </li>
                    </a>
                `;
                // Hiển thị ra danh sách chat bên leftSide
                $('#all-chat').find('ul.person_chat').prepend(leftSideData);
                $('#user-chat').find('ul').prepend(leftSideData);

                // tạo hộp thoại trò chuyện (box conversation) - rightside
                let rightSideData = `
                    <div class="right tab-pane" data-chat="${data.newContact._id}" id="to_${data.newContact._id}">
                        <div class="top">
                            <span>To: <span class="name">${data.newContact.info.firstname} ${data.newContact.info.lastname}</span></span>
                            <span class="chat-menu-right">
                                <a href="#attachmentsModal_${data.newContact._id}" class="show-attachments" data-toggle="modal">
                                    Attachments
                                    <i class="fa fa-paperclip"></i>
                                </a>
                            </span>
                            <span class="chat-menu-right">
                                <a href="javascript:void(0)">&nbsp;</a>
                            </span>
                            <span class="chat-menu-right">
                                <a href="#imagesModal_${data.newContact._id}" class="show-images" data-toggle="modal">
                                    Images
                                    <i class="fa fa-photo"></i>
                                </a>
                            </span>
                        </div>
                        
                        <div class="content-chat">
                            <div class="chat" data-chat="${data.newContact._id}">
                                
                            </div>
                        </div>
                        
                        <div class="write" data-chat="${data.newContact._id}">
                            <input type="text" class="write-chat" id="write-chat-${data.newContact._id}" data-chat="${data.newContact._id}">
                            <div class="icons">
                                <a href="#" class="icon-chat" data-chat="${data.newContact._id}"><i class="fa fa-smile-o"></i></a>
                                <label for="image-chat-${data.newContact._id}">
                                    <input type="file" id="image-chat-${data.newContact._id}" name="my-image-chat"
                                    class="image-chat" data-chat="${data.newContact._id}">
                                    <i class="fa fa-photo"></i>
                                </label>
                                <label for="attachments-chat-${data.newContact._id}">
                                    <input type="file" id="attachments-chat-${data.newContact._id}" name="my-attachments-chat"
                                    class="attachments-chat" data-chat="${data.newContact._id}">
                                    <i class="fa fa-paperclip"></i>
                                </label>
                                <a href="javascript:void(0)" id="video-chat-${data.newContact._id}" 
                                class="video-chat" data-chat="${data.newContact._id}">
                                    <i class="fa fa-video-camera"></i>
                                </a>
                            </div>
                        </div>
                    
                    </div>
                `;
                // đẩy bảng chat của group mới lên html
                $('#screen_chat').prepend(rightSideData);

                // gọi lại hàm changeScreenChat để thay đổi màn hình chat
                changeScreenChat();

                // gọi hàm xóa bạn bè
                removeContact();

                // gọi hàm trỏ đến cuộc trò chuyện khi bấm chatting trong danh sách chat
                chattingClick();
            }
        })
    })
}
// hủy kết bạn
function removeContact() {
    $('.user-remove-contact').unbind('click').on('click', function() {
        let targetId = $(this).data('uid');
        let targetName = $(`#contactsModal #contacts ul.contactList li[data-uid = ${targetId}] .user-name p`).text();

        // form xác nhận xóa bạn
        var mess = `<p>Are you sure you want to delete <b>${targetName}</b>?</p>`;
        alertify.set({ labels: { ok: "Yes", cancel: "No" } });
        alertify.confirm( mess, function (e) {
            if (e) {
                $.ajax({
                    url: "/chatapp/contact/remove-contact",
                    type: "delete",
                    data: {uid: targetId},
                    success: function(data) {
                        // xóa khỏi danh sách bạn bè
                        $(`#contactsModal #contacts ul.contactList li[data-uid = ${targetId}]`).remove();
        
                        // xóa khỏi danh sách chat bên leftSide
                        $('#all-chat').find(`.person_chat li[data-chat = ${targetId}]`).remove();
                        $('#user-chat').find(`.people li[data-chat = ${targetId}]`).remove();
        
                        // xóa hộp thoại trò chuyện phái rightside
                        $(`#screen_chat div.right[data-chat = ${targetId}]`).remove();
        
                        // gửi sự kiện lên server
                        socket.emit("remove-contact", {contactId: targetId, currentUserId: currentUserId});
                    }
                })
            } else {
                return false;
            }
        });
    })
}
// bấm nút chatting trong danh sách contact
function chattingClick() {
    $('.user-talk').unbind('click').on('click', function() {
        let targetId = $(this).data('uid');
        // click contact tương ứng bên leftside
        $('ul.people').find(`li[data-chat = ${targetId}]`)[0].click();
        // đóng contact modal 
        $('#contactsModal').modal('toggle');
    })
}

$(document).ready(function() {
    // TÌM KIẾM
    $('#input-search-user-to-add-contact').bind('keypress', searchUserToAddContact);
    $('#btn-search-user-to-add-contact').bind('click', searchUserToAddContact);

    // LẮNG NGHE SERVER GỬI LỜI MỜI KẾT BẠN VỀ (NGƯỜI NHẬN)
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
        `);

        // gọi hàm hủy yêu cầu kết bạn nhận được (người nhận)
        removeRequestContactReceived();

        // GỌI HÀM LẮNG NGHE ĐỒNG Ý KẾT BẠN (NGƯỜI GỬI)
        acceptRequestContact();
    })

    // LẮNG NGHE HỦY YÊU CẦU KẾT BẠN TỪ SERVER VỀ (NGƯỜI NHẬN)
    socket.on("server-send-remove-request-contact-sent", function(data) {
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

    // GỌI HÀM HỦY YÊU CẦU ĐÃ GỬI TRONG DANH SÁCH CHỜ (NGƯỜI GỬI)
    removeRequestContactSent();

    // GỌI HÀM HỦY YÊU CẦU NHẬN ĐƯỢC (NGƯỜI NHẬN)   
    removeRequestContactReceived();

    // LẮNG NGHE HỦY YÊU CẦU KẾT BẠN NHẬN ĐƯỢC (NGƯỜI NHẬN)
    socket.on("server-send-remove-request-contact-received", function(data) {
        $('#find-user').find(`div.user-add-new-contact[data-uid = ${data.currentUserId}]`).css('display', 'inline-block');
        $('#find-user').find(`div.user-remove-request-contact-sent[data-uid = ${data.currentUserId}]`).hide();

        // gọi hàm giảm số lượng thông báo ở contact management
        decreaseRequestContactNumber("count-request-contact-sent");

        // xóa khỏi danh sách chờ
        $(`#contactsModal #request-contact-sent ul.contactList li[data-uid = ${data.currentUserId}]`).remove();
    })

    // GỌI HÀM LẮNG NGHE ĐỒNG Ý KẾT BẠN (NGƯỜI GỬI)
    acceptRequestContact();


    // LẮNG NGHE SERVER TRẢ TRẠNG THÁI CỦA NGƯỜI DÙNG VỪA ĐƯỢC ĐỒNG Ý KẾT BẠN - NẾU NGƯỜI DÙNG ĐÓ ĐANG OFFLINE (NGƯỜI ĐỒNG Ý)
    socket.on("server-send-acccept-contact-received-status", function(data) {
        if (data.offline) { // offline
            // Xóa bỏ trạng thái online vừa được prepend lên lefside ở người đồng ý
            $('#all-chat').find(`ul.person_chat li[data-chat = ${data.contactId}] .status`).removeClass("online");
            $('#user-chat').find(`li[data-chat = ${data.contactId}] .status`).removeClass("online");
        }
    })

    // LẮNG NGHE ĐỒNG Ý KẾT BẠN (NGƯỜI GỬI) - NẾU NGƯỜI NHẬN ĐƯỢC ĐỒNG Ý KẾT BẠN ĐANG ONLINE
    socket.on("server-send-acccept-contact-received", function(data) {
        // đẩy thông báo lên
        let notiAccept = `
            <div class="notif-readed-false" data-uid="${data.newContact.id}">
                <img class="avatar-small" src="${data.newContact.avatar}" alt="">
                <strong>
                    ${data.newContact.name}
                </strong> has accepted your contact request.
            </div>
        `;
        $(`.noti_content`).prepend(notiAccept);
        // gọi hàm tăng thông báo ở navbar
        increaseRequestNotification("noti_counter", 1);

        // xóa yêu cầu kết bạn khỏi danh sách chờ
        $(`#contactsModal #request-contact-sent ul.contactList li[data-uid = ${data.newContact.id}]`).remove();

        // nếu ở khung search user vẫn còn (khi vừa gửi thì bên kia đồng ý luôn) thì xóa đi
        $('#find-user').find(`.contact-list li[data-uid = ${data.newContact.id}]`).remove();

        // thêm vào danh sách contact ở contact management modal
        $(`#contactsModal #contacts ul.contactList`).prepend(`
            <li class="_contactList" data-uid="${data.newContact.id}">
                <div class="contactPanel">
                    <div class="user-avatar">
                        <img src="${data.newContact.avatar}" alt="">
                    </div>
                    <div class="user-name">
                        <p>
                            ${data.newContact.name}
                        </p>
                    </div>
                    <br>
                    <div class="user-address">
                        <span>&nbsp ${data.newContact.email}</span>
                    </div>
                    <div class="user-talk" data-uid="${data.newContact.id}">
                        Chatting
                    </div>
                    <div class="user-remove-contact action-danger" data-uid="${data.newContact.id}">
                        Delete contact
                    </div>
                </div>
            </li>
        `);

        // hiển thị contact mới lên danh sách trò chuyện - leftside
        let leftSideData = `
            <a href="#uid_${data.newContact.id}" class="room-chat" id="null-contact" data-target="#to_${data.newContact.id}">
                <li class="person" data-chat="${data.newContact.id}">
                    <div class="left-avatar">
                        <div class="status dot online"></div>
                        <img src="${data.newContact.avatar}" alt="">
                    </div>
                    <span class="name">
                        ${data.newContact.name}
                    </span><br>
                    <span class="time"></span>
                    <span class="preview"></span>
                </li>
            </a>
        `;
        // Hiển thị ra danh sách chat bên leftSide
        $('#all-chat').find('ul.person_chat').prepend(leftSideData);
        $('#user-chat').find('ul').prepend(leftSideData);

        // tạo hộp thoại trò chuyện (box conversation) - rightside
        let rightSideData = `
            <div class="right tab-pane" data-chat="${data.newContact.id}" id="to_${data.newContact.id}">
                <div class="top">
                    <span>To: <span class="name">${data.newContact.name}</span></span>
                    <span class="chat-menu-right">
                        <a href="#attachmentsModal_${data.newContact.id}" class="show-attachments" data-toggle="modal">
                            Attachments
                            <i class="fa fa-paperclip"></i>
                        </a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="javascript:void(0)">&nbsp;</a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="#imagesModal_${data.newContact.id}" class="show-images" data-toggle="modal">
                            Images
                            <i class="fa fa-photo"></i>
                        </a>
                    </span>
                </div>
                
                <div class="content-chat">
                    <div class="chat" data-chat="${data.newContact.id}">
                        
                    </div>
                </div>
                
                <div class="write" data-chat="${data.newContact.id}">
                    <input type="text" class="write-chat" id="write-chat-${data.newContact.id}" data-chat="${data.newContact.id}">
                    <div class="icons">
                        <a href="#" class="icon-chat" data-chat="${data.newContact.id}"><i class="fa fa-smile-o"></i></a>
                        <label for="image-chat-${data.newContact.id}">
                            <input type="file" id="image-chat-${data.newContact.id}" name="my-image-chat"
                            class="image-chat" data-chat="${data.newContact.id}">
                            <i class="fa fa-photo"></i>
                        </label>
                        <label for="attachments-chat-${data.newContact.id}">
                            <input type="file" id="attachments-chat-${data.newContact.id}" name="my-attachments-chat"
                            class="attachments-chat" data-chat="${data.newContact.id}">
                            <i class="fa fa-paperclip"></i>
                        </label>
                        <a href="javascript:void(0)" id="video-chat-${data.newContact.id}" 
                        class="video-chat" data-chat="${data.newContact.id}">
                            <i class="fa fa-video-camera"></i>
                        </a>
                    </div>
                </div>
            
            </div>
        `;
        // đẩy bảng chat của group mới lên html
        $('#screen_chat').prepend(rightSideData);
        
        // gọi lại hàm changeScreenChat để thay đổi màn hình chat khi click
        changeScreenChat();

        // GỌI HÀM XÓA BẠN BÈ
        removeContact()
    })

    // GỌI HÀM XÓA BẠN BÈ
    removeContact();

    // LẮNG NGHE SỰ KIỆN XÓA BẠN BÈ (NGƯỜI BỊ XÓA)
    socket.on("server-send-remove-contact", function(data) {
        // xóa khỏi danh sách bạn
        $(`#contactsModal #contacts ul.contactList li[data-uid = ${data.currentUserId}]`).remove();

        // xóa khỏi danh sách chat bên leftSide
        $('#all-chat').find(`.person_chat li[data-chat = ${data.currentUserId}]`).remove();
        $('#user-chat').find(`.people li[data-chat = ${data.currentUserId}]`).remove();

        // xóa hộp thoại trò chuyện phái rightside
        $(`#screen_chat div.right[data-chat = ${data.currentUserId}]`).remove();
    })

    // gọi hàm trỏ đến cuộc trò chuyện khi bấm chatting trong danh sách chat
    chattingClick();
})