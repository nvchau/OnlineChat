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

        $.get(`/chatapp/search-user/${keyword}`, function(data) {
            var currentUser = $('#currentUserId').val();
            // mỗi lần tìm kiếm thì làm sạch list cũ
            $('ul#group-chat-friends').html('');

            for (var userItem of data.usersListSearch) {
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

        }, function(data) {
            // console.log(data);
            // Ẩn modal
            $('#btn-cancel-group-chat').click(); // click gọi lại hàm cancelCreateGroup để reset modal
            $('#groupChatModal').modal("hide");

            // hiển thị group mới tạo lên leftSide
            letSubStringGroupName = data.name; // kiểm tra độ dài của tên group, nếu quá 15 thì ẩn bớt
            if (letSubStringGroupName.length > 15) {
                letSubStringGroupName = letSubStringGroupName.substring(0, 14) + '<span>...</span>';
            };

            let leftSide = `
                <a href="#uid_${data._id}" class="room-chat" id="null-contact" data-target="#to_${data._id}">
                    <li class="person" data-chat="${data._id}">
                        <div class="left-avatar">
                            <div class="dot online"></div>
                            <img src="${data.image_path}" alt="">
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
                <div class="right tab-pane" data-chat="${data._id}" id="to_${data._id}">
                    <div class="top">
                        <span>To: <span class="name">${data.name}</span></span>
                        <span class="chat-menu-right">
                            <a href="#memberGroup_${data._id}" data-toggle="modal" data-target="#memberGroup_${data._id}">
                                Members &nbsp;
                                <i class="fa fa-users"></i>
                            </a>
                        </span>
                    </div>
                    
                    <div class="content-chat">
                        <div class="chat" data-chat="${data._id}"></div>
                    </div>
                    
                    <div class="write" data-chat="${data._id}">
                        <input type="text" class="write-chat chat-in-group" id="write-chat-${data._id}" data-chat="${data._id}">
                        <div class="icons">
                            <a href="#" class="icon-chat" data-chat="${data._id}"><i class="fa fa-smile-o"></i></a>
                            <!-- <label for="image-chat">
                                <input type="file" id="image-chat" name="my-image-chat" class="image-chat" data-chat="${data._id}">
                                <i class="fa fa-photo"></i>
                            </label>
                            <label for="attach-chat">
                                <input type="file" id="attach-chat" name="my-attach-chat" class="attach-chat" data-chat="${data._id}">
                                <i class="fa fa-paperclip"></i>
                            </label>
                            <a href="#streamModal" id="video-chat" class="video-chat" data-chat="${data._id}" data-toggle="modal">
                                <i class="fa fa-video-camera"></i>
                            </a> -->
                            <input type="hidden" id="peer-id" value="">
                        </div>
                    </div>
                
                </div>
            `;

            $('#screen_chat').prepend(rightSideData);

            // gọi lại hàm changeScreenChat để thay đổi màn hình chat
            changeScreenChat();

            // emit group vừa tạo (data) lên server để socket trả về cho các user còn lại
            socket.emit("new-group-created", {groupChat: data});

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
    socket.on("send-back-data-group-chat", function(data) {
        // console.log(data)
        var currentUser = $('#currentUserId').val();
        // hiển thị group mới tạo lên leftSide
        letSubStringGroupName = data.name; // kiểm tra độ dài của tên group, nếu quá 15 thì ẩn bớt
        if (letSubStringGroupName.length > 15) {
            letSubStringGroupName = letSubStringGroupName.substring(0, 14) + '<span>...</span>';
        };

        let leftSide = `
            <a href="#uid_${data._id}" class="room-chat" id="null-contact" data-target="#to_${data._id}">
                <li class="person" data-chat="${data._id}">
                    <div class="left-avatar">
                        <div class="dot online"></div>
                        <img src="${data.image_path}" alt="">
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
        data.members.forEach(function(member_item, index) {
            // nếu id của người nhận bằng id người đang đăng nhập thì mới đẩy dữ liệu lên (id của người dùng ở client khác)
            if (member_item == currentUser) {
                $('#all-chat').find('ul.group').prepend(leftSide);
                $('#group-chat').find('ul').prepend(leftSide);
            }
        })

        // Đổ ra khung chat bên rightSide
        let rightSideData = `
            <div class="right tab-pane" data-chat="${data._id}" id="to_${data._id}">
                <div class="top">
                    <span>To: <span class="name">${data.name}</span></span>
                    <span class="chat-menu-right">
                        <a href="#memberGroup_${data._id}" data-toggle="modal" data-target="#memberGroup_${data._id}">
                            Members &nbsp;
                            <i class="fa fa-users"></i>
                        </a>
                    </span>
                </div>
                
                <div class="content-chat">
                    <div class="chat" data-chat="${data._id}"></div>
                </div>
                
                <div class="write" data-chat="${data._id}">
                    <input type="text" class="write-chat chat-in-group" id="write-chat-${data._id}" data-chat="${data._id}">
                    <div class="icons">
                        <a href="#" class="icon-chat" data-chat="${data._id}"><i class="fa fa-smile-o"></i></a>
                        <!-- <label for="image-chat">
                            <input type="file" id="image-chat" name="my-image-chat" class="image-chat" data-chat="${data._id}">
                            <i class="fa fa-photo"></i>
                        </label>
                        <label for="attach-chat">
                            <input type="file" id="attach-chat" name="my-attach-chat" class="attach-chat" data-chat="${data._id}">
                            <i class="fa fa-paperclip"></i>
                        </label>
                        <a href="#streamModal" id="video-chat" class="video-chat" data-chat="${data._id}" data-toggle="modal">
                            <i class="fa fa-video-camera"></i>
                        </a> -->
                        <input type="hidden" id="peer-id" value="">
                    </div>
                </div>
            </div>
        `;

        data.members.forEach(function(member_item, index) {
            // nếu id của người nhận bằng id người đang đăng nhập thì mới đẩy dữ liệu lên (id của người dùng ở client khác)
            if (member_item == currentUser) {
                $('#screen_chat').prepend(rightSideData);
            }
        })

        // gọi lại hàm changeScreenChat để thay đổi màn hình chat
        changeScreenChat();
    })
})