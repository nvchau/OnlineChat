// socket.io
const socket = io();

function nineScrollLeft() {
  $('.left').niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}

function nineScrollRight(divId) {
  $(`.right .chat[data-chat = ${divId}]`).niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
  $(`.right .chat[data-chat = ${divId}]`).scrollTop($(`.right .chat[data-chat = ${divId}]`)[0].scrollHeight); // trỏ đến tin nhắn cuối cùng
}

function enableEmojioneArea(divId) {
  $(`#write-chat-${divId}`).emojioneArea({
    standalone: false,
    pickerPosition: 'top',
    filtersPosition: 'bottom',
    tones: false,
    autocomplete: false,
    inline: true,
    hidePickerOnBlur: true,
    search: false,
    shortnames: false,
    events: {
      keyup: function(editor, event) { 
        // gán giá trị thay đổi vào vài thẻ input đã bị ẩn
        // lắng nghe và gán emoji mới nhập vào input nhập tin nhắn theo đúng id
        $(`#write-chat-${divId}`).val(this.getText());
      },
      click: function() { // lắng nghe click button mở emoji
        // bật lắng nghe DOM cho việc chat tin nhắn văn bản + emoji
        textAndEmojiChat(divId); // hàm này bên file textAndEmojiChat.js

        // ==============================================================
        // BẮT SỰ KIỆN CLIENT ĐANG NHẬP TIN NHẮN (typing)| lúc click vào input
        var currentUserId = $('#currentUserId').val();
        var currentUserName = $('#currentUserName').val();
        var typingData = {
          senderId: currentUserId,
          senderName: currentUserName, // người đang nhập
          receiverId: divId // đối tượng đang được nhập
        }
        socket.emit("client-is-typing", typingData); // gửi sự kiện lên server
        // bắt sự kiện client ngừng nhập
        $(`#write-chat-${divId}`).focusout(function(){ // ngừng trỏ vào input
            socket.emit("client-stop-typing", typingData);
        });
        // ==============================================================
      }
    },
  });
  
  $('.icon-chat').bind('click', function(event) {
    event.preventDefault();
    $('.emojionearea-button').click();
    $('.emojionearea-editor').focus();
  });
}

function spinLoaded() {
  $('#loader').css('display', 'none');
}

function spinLoading() {
  $('#loader').css('display', 'block');
}

function ajaxLoading() {
  $(document)
    .ajaxStart(function() {
      spinLoading();
    })
    .ajaxStop(function() {
      spinLoaded();
    });
}

function showModalContacts() {
  $('#show-modal-contacts').click(function() {
    $(this).find('.noti_contact_counter').fadeOut('slow');
  });
}

function configNotification() {
  // click nút đánh dấu tất cả thông báo là đã đọc
  $('#noti_Button').click(function() {
    $('#notifications').fadeToggle('fast', 'linear');
    $('.noti_counter').fadeOut('slow');
    return false;
  });
  // click ra ngoài thì ẩn khung chứa thông báo
  $(".main-content").click(function() {
    $('#notifications').fadeOut('fast', 'linear');
  });
}

function gridPhotos(layoutNumber) {
  $(".show-images").unbind("click").on("click", function() {
    let href = $(this).attr("href");
    let modalImagesId = href.replace("#", "");

    let countRows = Math.ceil($(`#${modalImagesId}`).find('div.all-images>img').length / layoutNumber);
    let layoutStr = new Array(countRows).fill(layoutNumber).join("");
    $(`#${modalImagesId}`).find('div.all-images').photosetGrid({ // LỖI Ở ĐÂY 
      highresLinks: true,
      rel: 'withhearts-gallery',
      gutter: '2px',
      layout: layoutStr,
      onComplete: function() {
        $(`#${modalImagesId}`).find('.all-images').css({
          'visibility': 'visible'
        });
        $(`#${modalImagesId}`).find('.all-images a').colorbox({
          photo: true,
          scalePhotos: true,
          maxHeight: '90%',
          maxWidth: '90%'
        });
      }
    });
  });
}


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
  $('#cancel-group-chat').bind('click', function() {
    $('#groupChatModal .list-user-added').hide();
    if ($('ul#friends-added>li').length) {
      $('ul#friends-added>li').each(function(index) {
        $(this).remove();
      });
    }
  });
}

// thay đổi kiểu chat (trong select ở leftside)
function changeTypeChat(){
  $('#select-type-chat').bind('change', function(){
    let optionSelected = $('option:selected', this);
    optionSelected.tab('show');

    // ẩn hiện nút tạo group khi chuyển chế độ chat
    if ($(this).val() === 'group-chat') {
      $('.create-group-chat').show();
      // Do something...
    } else {
      $('.create-group-chat').hide();
    }
  })
}

// thay đổi màn hình chat
function changeScreenChat(){
  $('.room-chat').unbind("click").on("click", function(){
    // làm trắng tất cả li khi trỏ cuộc trò chuyện mới
    $('.person').removeClass('active');
    // active khi trỏ đến cuộc trò chuyện
    $(this).find('li').addClass('active');
    // hiển thị bảng chat ra
    $(this).tab("show");
    // cấu hình thanh cuộn bên box chat rightSidenav.ejs mỗi khi click vào một cuộc trò chuyện cụ thể
    let divId = $(this).find('li').data('chat'); // lấy id của cuộc trò chuyện (user hoặc group)
    nineScrollRight(divId);

    // Bật emoji, tham số truyền vào là id của box nhập nội dung tin nhắn
    enableEmojioneArea(divId); // mỗi lần click sẽ thay đổi màn hình chat 1 lần, tương tự sẽ gọi lại hàm 1 lần

    // Lắng nghe DOM cho image-chat | tham số truyền vào là id của box nhập nội dung tin nhắn
    imageChat(divId);

    // Lắng nghe DOM cho video-chat | tham số truyền vào là id của box nhập nội dung tin nhắn
    videoChat(divId);

    // Lắng nghe DOM cho attachment-chat (tệp đính kèm) | tham số truyền vào là id của box nhập nội dung tin nhắn
    attachmentsChat(divId)
  });
}

$(document).ready(function() {
  // thay đổi kiểu chat
  changeTypeChat();

  // thay đổi màn hình chat
  changeScreenChat();

  // Hide số thông báo trên đầu icon mở modal contact
  showModalContacts();

  // Bật tắt popup notification
  configNotification();

  // Cấu hình thanh cuộn
  nineScrollLeft();
  // nineScrollRight();

  // Icon loading khi chạy ajax
  ajaxLoading();

  // Hiển thị hình ảnh grid slide trong modal tất cả ảnh, tham số truyền vào là số ảnh được hiển thị trên 1 hàng.
  // Tham số chỉ được phép trong khoảng từ 1 đến 5 | tương ứng với số ảnh trên mỗi hàng
  // gridPhotos(5); // đang lỗi chưa chạy được -> đang tạm set css

  // trỏ đến cuộc trò chuyện đầu tiên ở leftside khi reload trang
  $('ul.people').find('a')[0].click();
});
