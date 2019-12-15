// hàm này được gọi ở hàm sreenChat trog mainConfig.js
function videoChat(duvId) {
    $(`#video-chat-${duvId}`).unbind("click").on("click", function() {
        let listenerId = $(this).data("chat");
        let callerName = $('#currentUserName').val();
        let callerId = $("#currentUserId").val();
        
        let dataToEmit = {
            listenerId: listenerId, // id người nghe
            callerId: callerId, // id người gọi
            callerName: callerName // tên người gọi
        }

        // Bước 1 (của người gọi): kiểm tra người nghe có online không 
        socket.emit("caller-check-listener-online-or-not", dataToEmit);
    })
}

$(document).ready(function() {
    // Bước 2 (của người gọi): lắng nghe server trả về trạng thái của listener offline 
    socket.on("listener-is-offline", function(){
        alertify.error("This user is offline.");
    })
    
    // ==== KHỞI TẠO PEER ====
    let getPeerId = "";
    // mỗi lần reload trang, client sẽ có một peerId khác nhau
    const peer = new Peer(); // tạo mới peer
    // const peer = new Peer({
    //     key: "peerjs",
    //     host: "peerjs-server-nvchaudev.herokuapp.com",
    //     secure: true,
    //     port: 443,
    //     // debug: 3
    // });
    // console.log(peer);
    peer.on("open", function(peerId) { // lắng nghe sự kiện khởi tạo peer để trả về peerId
        // console.log(peerId);
        getPeerId = peerId;
    })
    // hàm mở luồng cho stream
    function openStream() {
        const config = { audio: true, video: true };
        return navigator.mediaDevices.getUserMedia(config);
    };
    // hàm chạy stream
    function playStream(idVideoTag, stream) {
        const video = document.getElementById(idVideoTag);
        video.srcObject = stream;
        video.play();
    };
    // ==== END PEER ====

    // Bước 3 (của người nghe): lắng nghe server trả response và yêu cầu lấy peerId của người nghe về clients 
    socket.on("server-request-peer-id-of-listener", function(response) {
        let currentId = $("#currentUserId").val();
        if (response.listenerId == currentId) {
            let listenerName = $('#currentUserName').val(); // lúc này người nghe là người khác nên DOM ở đây sẽ lấy được tên người nghe
            let dataToEmit = {
                callerId: response.callerId,
                listenerId: response.listenerId,
                callerName: response.callerName,
                listenerName: listenerName,
                listenerPeerId: getPeerId
            };
    
            // Bước 4 (của người nghe): gửi dữ liệu kèm peerId về socket-server 
            socket.emit("listener-emit-peer-id-to-server", dataToEmit);
        }
    })

    // Bước 5 (của người gọi): Lắng nghe server gửi response kèm peerId của người nghe 
    socket.on("server-send-peerId-of-listener-to-caller", function(response) {
        let dataToEmit = {
            callerId: response.callerId,
            listenerId: response.listenerId,
            callerName: response.callerName,
            listenerName: response.listenerName,
            listenerPeerId: response.listenerPeerId
        };

        // Bước 6 (của người gọi): người gọi gửi request yêu cầu gọi đến người nghe
        socket.emit("caller-request-call-to-server", dataToEmit);

        // show sweetalert lên khi gọi
        const currentCallerId = $("#currentUserId").val();
        if (response.callerId == currentCallerId) { // client đang online nào có id = id người gọi thì show modal
            let timerInterval;
            Swal.fire({
                title: `Calling &nbsp <span style="color: #2ECC71">${response.listenerName}</span> &nbsp <i class="fa fa-volume-control-phone"></i>`,
                html: `
                    Time: <strong style="color: #d43f3a"></strong> seconds. <br><br>
                    <button id="btn-cancel-call" class="btn btn-danger">
                        Cancel
                    </button>    
                `,
                // backdrop: "rgba(85, 85, 0.4)",
                width: "52rem",
                allowOutsideClick: false,
                timer: 30000, // 30 seconds
                onBeforeOpen: () => {
                    $("#btn-cancel-call").unbind("click").on("click", function() {
                        Swal.close(); // đóng modal
                        clearInterval(timerInterval); // xóa bộ đếm giờ

                        // Bước 7 - video chat: hủy cuộc gọi phía người nghe nhận được
                        socket.emit("caller-cancel-request-call-to-server", dataToEmit);
                    });

                    Swal.showLoading();
                    timerInterval = setInterval(() => {
                        Swal.getContent().querySelector('strong').textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                    }, 1000)
                },
                // lắng nghe khi đang yêu cầu cuộc gọi (nếu người nghe từ chối)
                onOpen: () => {
                    // Bước 12 (của người gọi): lắng nghe khi người nghe từ chối
                    socket.on("server-send-reject-call-to-caller", function(response) {
                        // đóng modal
                        Swal.close();
                        clearInterval(timerInterval);
                        // mở modal thông báo
                        if (response.callerId == currentCallerId) {
                            Swal.fire({
                                type: "info",
                                title: `<span style="color: #2ECC71">${response.listenerName}</span> &nbsp; rejected the call!`,
                                width: "52rem",
                                allowOutsideClick: false,
                                comfirmButtonColor: "#2ECC71",
                                comfirmButtonText: "Comfirm"
                            });
                        };
                    });

                    // Bước 13 (của người gọi): khi người nghe chấp nhận cuộc gọi
                    socket.on("server-send-accept-call-to-caller", function(response) {
                        // đóng modal
                        Swal.close();
                        clearInterval(timerInterval);
                        if (response.callerId == currentCallerId) {
                            // ==== THỰC HIỆN STREAM (PEER) PHÍA NGƯỜI GỌI ====
                            // mở modal video-chat
                            $('#streamModal').modal({
                                show: true,
                                // chống hiện tượng click ra ngoài sẽ mất modal
                                backdrop: 'static',
                                keyboard: false
                            });
                            // gọi hàm openStream của peerjs để mở luồng cho video-chat
                            openStream().then(stream => {
                                // gọi hàm playStream để chạy stream của người gọi
                                playStream('local-stream', stream); // local-stream: đây là id của thẻ video phía người gọi (trong videoChat.ejs)
                                const call = peer.call(response.listenerPeerId, stream); // truyền vào peerId của người nghe
                                // chạy stream của người nghe
                                call.on('stream', remoteStream => {
                                    playStream('remote-stream', remoteStream); // remote-stream: đây là id của thẻ video phía người nghe (trong videoChat.ejs)
                                });
                                
                                // lắng nghe sự kiện người nghe dừng cuộc gọi
                                socket.on("server-send-stop-call-to-caller", function(response) {
                                    call.close();
                                    stream.getTracks().forEach(track => track.stop());
                                    peer.removeAllListeners();
                                    // peer.destroy();
                                    // $('#streamModal').modal('hide');
                                })
                                // ngắt kết nối stream
                                $('#streamModal button#btn-end-stream').unbind('click').on('click', function() {
                                    call.close();
                                    stream.getTracks().forEach(track => track.stop());
                                    peer.removeAllListeners();
                                    // peer.destroy();
                                    // $('#streamModal').modal('hide');
                                    // gửi sự kiện dừng cuộc gọi lên server
                                    socket.emit("caller-send-stop-call-to-server", response);
                                })
                                $('#streamModal button.close').unbind('click').on('click', function() {
                                    call.close();
                                    stream.getTracks().forEach(track => track.stop());
                                    peer.removeAllListeners();

                                    socket.emit("caller-send-stop-call-to-server", response);
                                })
                            });
                            // ========== END STREAM ===========
                        };
                        
                    });
                   
                },
                onClose: () => {
                    clearInterval(timerInterval)
                }
            }).then((result) => {
                return false;
            })
        }
    })

    // Bước 8: Lắng nghe sự kiện gọi (của người nghe)
    socket.on("server-send-request-call-to-listener", function(response) {
        let dataToEmit = {
            callerId: response.callerId,
            listenerId: response.listenerId,
            callerName: response.callerName,
            listenerName: response.listenerName,
            listenerPeerId: response.listenerPeerId
        }

        // Bước 9 (của người nghe): show modal khi nhận được yêu cầu gọi 
        const currentListenerId = $("#currentUserId").val();
        if (response.listenerId == currentListenerId) { // client đang online nào có id = id người nghe thì show modal
            let timerInterval;
            Swal.fire({
                title: `<span style="color: #2ECC71">${response.callerName}</span> &nbsp is calling &nbsp <i class="fa fa-volume-control-phone"></i>`,
                html: `
                    Time: <strong style="color: #d43f3a"></strong> seconds. <br><br>
                    <button id="btn-reject-call" class="btn btn-danger">
                        Reject
                    </button>
                    <button id="btn-accept-call" class="btn btn-success">
                        Accept
                    </button>
                `,
                // backdrop: "rgba(85, 85, 0.4)",
                width: "52rem",
                allowOutsideClick: false,
                timer: 30000, // 30 seconds
                onBeforeOpen: () => {
                    // người nghe bấm hủy cuộc gọi
                    $("#btn-reject-call").unbind("click").on("click", function() {
                        Swal.close();
                        clearInterval(timerInterval);

                        // Bước 10 (của người nghe): gửi yêu cầu hủy cuộc gọi lên server
                        socket.emit("listener-reject-request-call-to-server", dataToEmit);
                    })
                    // người nghe bấm chấp nhận cuộc gọi
                    $("#btn-accept-call").unbind("click").on("click", function() {
                        Swal.close();
                        clearInterval(timerInterval);

                        // Bước 11 (của người nghe): gửi yêu cầu chấp nhận cuộc gọi lên server
                        socket.emit("listener-accept-request-call-to-server", dataToEmit);
                    })

                    Swal.showLoading();
                    timerInterval = setInterval(() => {
                        Swal.getContent().querySelector('strong').textContent = Math.ceil(Swal.getTimerLeft() / 1000)
                    }, 1000)
                },
                // lắng nghe khi đang yêu cầu cuộc gọi (nếu người gọi bấm hủy)
                onOpen: () => {
                    // Bước 9 (của người nghe): hủy cuộc gọi khi người gọi bấm hủy
                    socket.on("server-send-cancel-request-call-to-listener", function(response) {
                        // đóng cuộc gọi (modal ở phía người nghe) khi nhận được yêu cầu hủy của người gọi
                        Swal.close();
                        clearInterval(timerInterval);
                    });

                    // Bước 14 (của người nghe): khi người nghe chấp nhận cuộc gọi
                    socket.on("server-send-accept-call-to-listener", function(response) {
                        Swal.close();
                        clearInterval(timerInterval);
                        if (response.listenerId == currentListenerId) {
                            // ==== THỰC HIỆN STREAM (PEER) PHÍA NGƯỜI NGHE ====
                            // mở modal video-chat
                            $('#streamModal').modal({
                                show: true,
                                // chống hiện tượng click ra ngoài sẽ mất modal
                                backdrop: 'static',
                                keyboard: false
                            });
                            // lắng nghe có peer khác gọi đến
                            peer.on('call', call => {
                                // mở stream
                                openStream().then(stream => {
                                    call.answer(stream); // người nghe trả lời cuộc gọi
                                    // chạy stream của chính người nghe
                                    playStream('local-stream', stream);
                                    // chạy stream của người gọi
                                    call.on('stream', remoteStream => {
                                        playStream('remote-stream', remoteStream);
                                    });
                                    // người nghe lắng nghe sự kiện dừng cuộc gọi từ người gọi
                                    socket.on("server-send-stop-call-to-listener", function(response) {
                                        call.close();
                                        stream.getTracks().forEach(track => track.stop());
                                        peer.removeAllListeners();
                                        // peer.destroy();
                                        // $('#streamModal').modal('hide');

                                        // ====== ĐANG LÀM Ở ĐÂY - CHƯA THỂ NGẮT CUỘC GỌI ======

                                    })
                                    // người nghe dừng cuộc gọi
                                    $('#streamModal button#btn-end-stream').unbind('click').on('click', function() {
                                        call.close();
                                        stream.getTracks().forEach(track => track.stop());
                                        peer.removeAllListeners();
                                        // peer.destroy();
                                        // $('#streamModal').modal('hide');
                                        // gửi sự kiện dừng cuộc gọi lên server
                                        socket.emit("listener-send-stop-call-to-server", response);
                                    })
                                    $('#streamModal button.close').unbind('click').on('click', function() {
                                        call.close();
                                        stream.getTracks().forEach(track => track.stop());
                                        peer.removeAllListeners();

                                        socket.emit("listener-send-stop-call-to-server", response);
                                    })
                                });
                            });
                            // ==== END STREAM ====
                        };
                        
                    });
                },
                onClose: () => {
                    clearInterval(timerInterval)
                }
            }).then((result) => {
                return false;
            })
        }
    })

})