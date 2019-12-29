// đếm tăng số lượng yêu cầu kết bạn đã gửi
function increaseRequestContactNumber(className) {
    let currentValue = +$(`.${className}`).find("em").text(); // dấu cộng phía trước để chuyển string thành number - nếu rỗng thì mặc định trả về là số 0
    currentValue += 1;
    if (currentValue === 0) {
        $(`.${className}`).html('');
    } else {
        $(`.${className}`).html(`(<em>${currentValue}</em>)`);
    }
}
// giảm số lượng yêu cầu kết bạn đã gửi
function decreaseRequestContactNumber(className) {
    let currentValue = +$(`.${className}`).find("em").text(); // dấu cộng phía trước để chuyển string thành number - nếu rỗng thì mặc định trả về là số 0
    currentValue -= 1;
    if (currentValue === 0) {
        $(`.${className}`).html('');
    } else {
        $(`.${className}`).html(`(<em>${currentValue}</em>)`);
    }
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
                
                // gọi hàm cộng số lượng
                increaseRequestContactNumber("count-request-contact-sent");
                
                // increaseNumberNotifContact('coutn-request-contact-snet');
                socket.emit('add-new-contact', {contactId: targetId});

                alertify.success(`Sent a friend invitation to <b>${targetName}</b>`);

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
                `)
            }
            // nếu đã là bạn bè hoặc đã gửi lời mời kết bạn
            if (data.contactExits) {
                alertify.error("Exists contact");
            }
        })
    })
}
// hủy yêu cầu kết bạn
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
                
                // gọi hàm đếm giảm số lượng
                decreaseRequestContactNumber("count-request-contact-sent");
            }
        })
    })
}

$(document).ready(function() {
    // tìm kiếm
    $('#input-search-user-to-add-contact').bind('keypress', searchUserToAddContact);
    $('#btn-search-user-to-add-contact').bind('click', searchUserToAddContact);
})