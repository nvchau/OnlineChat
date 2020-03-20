//====== tạo mới group chat, thêm thành viên cho group =======

function addFriendsToGroup() {
    $('ul#group-chat-friends').find('div.add-user').bind('click', function() {
        let uid = $(this).data('uid');
        $(this).remove();
        let html = $('ul#group-chat-friends').find('div[data-uid=' + uid + ']').html();

        let promise = new Promise(function(resolve, reject) {
        $('ul#friends-added').append(html);
        $('#groupChatModal .list-user-added').show();
        resolve(true);
        });
        promise.then(function(success) {
        $('ul#group-chat-friends').find('div[data-uid=' + uid + ']').remove();
        });
    });
}
  
function cancelCreateGroup() {
    $('#btn-cancel-group-chat').bind('click', function() {
        $("#input-name-group-chat").val('');
        $('#groupChatModal .list-user-added').hide();
        if ($('ul#friends-added>li').length) {
            $('ul#friends-added>li').each(function(index) {
                $(this).remove();
            });
        }
    });
}

function callSearchUser(element) {
    if (element.which === 13 || element.type === "click" ) {
        let keyword = $("#input-search-user-to-add-group-chat").val();
        // let regexKeyword = new RegExp(/^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/);

        if (!keyword.replace(/\s/g, '').length) {
            // alertify.error('No search text entered.');
            return false;
        }

        $.get(`/chatapp/search-friend/${keyword}`, // gửi keyword qua params
        function(data) { // nhận lại data từ server
            var currentUser = $('#currentUserId').val();
            // mỗi lần tìm kiếm thì làm sạch list cũ
            $('ul#group-chat-friends').html('');

            for (var userItem of data.userListSearchToSend) {
                if (userItem._id != currentUser) {
                    $('ul#group-chat-friends').append(`
                        <div data-uid="${userItem._id}">
                            <li data-uid="${userItem._id}">
                                <div class="contactPanel">
                                    <div class="user-avatar">
                                        <img src="${userItem.image_path}" alt="">
                                    </div>
                                    <div class="user-name">
                                        <p>
                                        &nbsp ${userItem.info.firstname} ${userItem.info.lastname}
                                        </p>
                                    </div>
                                    <br>
                                    <div class="user-address">
                                        <span>&nbsp ${userItem.local.email}</span>
                                    </div>
                                    <div class="add-user" data-uid="${userItem._id}">
                                        Add to group
                                    </div>
                                </div>
                            </li>
                        </div>
                    `);
                }
            }

            // Thêm người dùng vào danh sách liệt kê trước khi tạo nhóm trò chuyện
            addFriendsToGroup();
            // Action hủy việc tạo nhóm trò chuyện
            cancelCreateGroup();
        })
    }
}

function callCreateGroupChat() {
    $(`#btn-create-group-chat`).unbind("click").on("click", function() {
        // đếm số lượng user đã được chọn
        let countUsers = $("ul#friends-added").find("li"); //tìm kiếm các thẻ li
        if (countUsers.length < 2) {
            alertify.error('The number of members must be greater than or equal to 2!');
            return false;
        }
        // lấy tên group
        let groupChatName = $("#input-name-group-chat").val();
        if (groupChatName.length < 5 || groupChatName > 30) {
            alertify.error('Group names are limited to 5-30 characters!');
            return false;
        }
        // lấy id của những user được chọn
        let arrayIds = [];
        $("ul#friends-added").find("li").each(function(index, item) { //each() là hàm dùng để lặp
            arrayIds.push($(item).data("uid")); // dom đến data-uid="..."
        });

        // gửi dữ liệu lên server
        $.post("/chatapp/group-chat/create-new-group", {
            arrayIds: JSON.stringify(arrayIds), // đưa array về JSON để gửi lên server
            groupChatName: groupChatName
        }, function(data) { // nhận lại data từ server
            // console.log(data.memberList);
            // console.log(data.groupData);
            // Ẩn modal
            $('#btn-cancel-group-chat').click(); // click gọi lại hàm cancelCreateGroup để reset modal
            $('#groupChatModal').modal("hide");

            // hiển thị group mới tạo lên leftSide
            letSubStringGroupName = data.groupData.name; // kiểm tra độ dài của tên group, nếu quá 15 thì ẩn bớt
            if (letSubStringGroupName.length > 15) {
                letSubStringGroupName = letSubStringGroupName.substring(0, 14) + '<span>...</span>';
            };

            let leftSide = `
                <a href="#uid_${data.groupData._id}" class="room-chat" id="null-contact" data-target="#to_${data.groupData._id}">
                    <li class="person" data-chat="${data.groupData._id}">
                        <div class="left-avatar">
                            <img src="${data.groupData.image_path}" alt="">
                        </div>

                        <span class="name">
                            <span class="group-chat-name">
                                ${letSubStringGroupName}
                            </span>
                        </span><br>
                        <span class="time"></span>
                        <span class="preview"></span>
                    </li>
                </a>`;
            
            // Hiển thị ra danh sách chat bên leftSide
            $('#all-chat').find('ul.group').prepend(leftSide);
            $('#group-chat').find('ul').prepend(leftSide);

            // Đổ ra khung chat bên rightSide
            let rightSideData = `
                <div class="right tab-pane" data-chat="${data.groupData._id}" id="to_${data.groupData._id}">
                    <div class="top">
                        <span>To: <span class="name">${data.groupData.name}</span></span>
                        <span class="chat-menu-right">
                            <a href="#memberGroup_${data.groupData._id}" data-toggle="modal" data-target="#memberGroup_${data.groupData._id}">
                                Members (${data.memberList.length}) &nbsp;
                                <i class="fa fa-users"></i>
                            </a>
                        </span>
                    </div>
                    
                    <div class="content-chat">
                        <div class="chat" data-chat="${data.groupData._id}"></div>
                    </div>
                    
                    <div class="write" data-chat="${data.groupData._id}">
                        <input type="text" class="write-chat chat-in-group" id="write-chat-${data.groupData._id}" data-chat="${data.groupData._id}">
                        <div class="icons">
                            <a href="#" class="icon-chat" data-chat="${data.groupData._id}"><i class="fa fa-smile-o"></i></a>
                            <label for="image-chat-${data.groupData._id}">
                                <input type="file" id="image-chat-${data.groupData._id}" name="my-image-chat"
                                class="image-chat chat-in-group" data-chat="${data.groupData._id}">
                                <i class="fa fa-photo"></i>
                            </label>
                            <label for="attachments-chat-${data.groupData._id}">
                                <input type="file" id="attachments-chat-${data.groupData._id}" name="my-attachments-chat"
                                class="attachments-chat chat-in-group" data-chat="${data.groupData._id}">
                                <i class="fa fa-paperclip"></i>
                            </label>
                        </div>
                    </div>
                
                </div>
            `;
            // đẩy bảng chat của group mới lên html
            $('#screen_chat').prepend(rightSideData);

            // tạo modal chứa member của group mới tạo
            let memberListOfNewGroup = `
                <div class="modal fade" id="memberGroup_${data.groupData._id}" role="dialog">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                                <h4 class="modal-title">Members list: <span class="group-chat-name">${data.groupData.name}</span></h4>
                            </div>
                            <div class="modal-body">
                                <ul class="list-members"></ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            // đẩy lên html danh sách member của group mới tạo
            $('.content').append(memberListOfNewGroup); // đẩy khung modal lên
            for(const memberList_item of data.memberList){ // đẩy list member lên modal
                $(`.content div#memberGroup_${data.groupData._id} .modal-content .modal-body .list-members`).append(
                    `<div data-uid="${memberList_item._id}">
                        <li data-uid="${memberList_item._id}">
                            <div class="contactPanel">
                                <div class="row"></div>
                                <div class="user-avatar">
                                    <img src="${memberList_item.image_path}" alt="">
                                </div>
                                <div class="user-name">
                                    <p>
                                        &nbsp ${memberList_item.info.firstname} ${memberList_item.info.lastname}
                                    </p>
                                </div>
                                <br>
                                <div class="user-address">
                                    &nbsp ${memberList_item.local.email}
                                </div>
                            </div>
                        </li>
                    </div>`
                );
            };

            // gọi lại hàm changeScreenChat để thay đổi màn hình chat
            changeScreenChat();

            // emit group vừa tạo (data) lên server để socket trả về cho các user còn lại
            socket.emit("new-group-created", data); // dữ liệu gửi lên là 1 object: data

        }).fail(function(response) {
            // errors
            alertify.error('Error: '+response);
            // console.log(response);
        });
    });
};

$(document).ready(function() {
    $('#input-search-user-to-add-group-chat').bind('keypress', callSearchUser);//có thể thay bind bằng on('input', ...) để load real-time ngay khi nhập
    $('#btn-search-user-to-add-group-chat').bind('click', callSearchUser);
    callCreateGroupChat();

    // lắng nghe server trả về (cho các client còn lại, trừ client vừa gửi tạo group)
    // bản chất "data" đây chính là object đã được emit từ client, nên tồn tại 2 phần từ là groupData và memberList
    socket.on("send-back-data-group-chat", function(data) {
        // console.log(data.memberList);
        // console.log(data.groupData);
        var currentUser = $('#currentUserId').val();
        // hiển thị group mới tạo lên leftSide
        letSubStringGroupName = data.groupData.name; // kiểm tra độ dài của tên group, nếu quá 15 thì ẩn bớt
        if (letSubStringGroupName.length > 15) {
            letSubStringGroupName = letSubStringGroupName.substring(0, 14) + '<span>...</span>';
        };

        let leftSide = `
            <a href="#uid_${data.groupData._id}" class="room-chat" id="null-contact" data-target="#to_${data.groupData._id}">
                <li class="person" data-chat="${data.groupData._id}">
                    <div class="left-avatar">
                        <img src="${data.groupData.image_path}" alt="">
                    </div>

                    <span class="name">
                        <span class="group-chat-name">
                            ${letSubStringGroupName}
                        </span>
                    </span><br>
                    <span class="time"></span>
                    <span class="preview"></span>
                </li>
            </a>`;
        
        // Hiển thị ra danh sách chat bên leftSide
        data.groupData.members.forEach(function(member_item, index) {
            // nếu id của người nhận bằng id người đang đăng nhập thì mới đẩy dữ liệu lên (id của người dùng ở client khác)
            if (member_item == currentUser) {
                $('#all-chat').find('ul.group').prepend(leftSide);
                $('#group-chat').find('ul').prepend(leftSide);
            }
        })

        // Đổ ra khung chat bên rightSide
        let rightSideData = `
            <div class="right tab-pane" data-chat="${data.groupData._id}" id="to_${data.groupData._id}">
                <div class="top">
                    <span>To: <span class="name">${data.groupData.name}</span></span>
                    <span class="chat-menu-right">
                        <a href="#memberGroup_${data.groupData._id}" data-toggle="modal" data-target="#memberGroup_${data.groupData._id}">
                            Members (${data.groupData.members.length}) &nbsp;
                            <i class="fa fa-users"></i>
                        </a>
                    </span>
                </div>
                
                <div class="content-chat">
                    <div class="chat" data-chat="${data.groupData._id}"></div>
                </div>
                
                <div class="write" data-chat="${data.groupData._id}">
                    <input type="text" class="write-chat chat-in-group" id="write-chat-${data.groupData._id}" data-chat="${data.groupData._id}">
                    <div class="icons">
                        <a href="#" class="icon-chat" data-chat="${data.groupData._id}"><i class="fa fa-smile-o"></i></a>
                        <label for="image-chat-${data.groupData._id}">
                            <input type="file" id="image-chat-${data.groupData._id}" name="my-image-chat"
                            class="image-chat chat-in-group" data-chat="${data.groupData._id}">
                            <i class="fa fa-photo"></i>
                        </label>
                        <label for="attachments-chat">
                            <input type="file" id="attachments-chat" name="my-attachments-chat" class="attachments-chat" data-chat="${data.groupData._id}">
                            <i class="fa fa-paperclip"></i>
                        </label>
                    </div>
                </div>
            </div>
        `;

        data.groupData.members.forEach(function(member_item, index) {
            // nếu id của người nhận bằng id người đang đăng nhập thì mới đẩy dữ liệu lên (id của người dùng ở client khác)
            if (member_item == currentUser) {
                // đẩy bảng chat của group mới lên html
                $('#screen_chat').prepend(rightSideData);
            }
        });

        // tạo modal chứa member của group mới tạo
        let memberListOfNewGroup = `
            <div class="modal fade" id="memberGroup_${data.groupData._id}" role="dialog">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title">Members list: <span class="group-chat-name">${data.groupData.name}</span></h4>
                        </div>
                        <div class="modal-body">
                            <ul class="list-members"></ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // đẩy lên html danh sách member của group mới tạo
        data.groupData.members.forEach(function(member_item, index) {
            // nếu id của người nhận bằng id người đang đăng nhập thì mới đẩy dữ liệu lên (id của người dùng ở client khác)
            if (member_item == currentUser) {
                $('.content').append(memberListOfNewGroup); // đẩy khung modal lên
                for(const memberList_item of data.memberList){ // đẩy list member lên modal
                    $(`.content div#memberGroup_${data.groupData._id} .modal-content .modal-body .list-members`).append(
                        `<div data-uid="${memberList_item._id}">
                            <li data-uid="${memberList_item._id}">
                                <div class="contactPanel">
                                    <div class="row"></div>
                                    <div class="user-avatar">
                                        <img src="${memberList_item.image_path}" alt="">
                                    </div>
                                    <div class="user-name">
                                        <p>
                                            &nbsp ${memberList_item.info.firstname} ${memberList_item.info.lastname}
                                        </p>
                                    </div>
                                    <br>
                                    <div class="user-address">
                                        &nbsp ${memberList_item.local.email}
                                    </div>
                                </div>
                            </li>
                        </div>`
                    );
                };
            }
        });

        // gọi lại hàm changeScreenChat để thay đổi màn hình chat
        changeScreenChat();
    })
})