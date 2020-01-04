#!/usr/bin/env node

/**
 * Module dependencies.
 */
const EventEmitter = require('events'); // giới hạn lắng nghe (on) của một module node là 11, import events để tăng giới hạn
EventEmitter.defaultMaxListeners = 100; // tăng giới giạn lắng nghe lên 30 (bao nhiêu cũng được)

var app = require('./app');
var debug = require('debug')('classield:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

// ===============================================================
// ========= SOCKET.IO ===========================================
var io = require("socket.io")(server);

// mảng chứa id tất cả client online
let currentUserId;
let clients = [];
// clientsObj: object có key là user._id và value là socket.id
let clientsObj = {};
// lắng nghe client kết nối
io.on("connection", function(socket) {
    console.log('Have user connected: '+socket.id);

    // =========== CHECK TRẠNG THÁI ONLINE-OFFLINE CỦA CLIENTS ============
    // lắng nghe mỗi khi đăng nhập client sẽ gửi id lên
    socket.on("client-login", function(clientId) {
        if (clientsObj[clientId]) { // nếu người dùng đã đăng nhập
            clientsObj[clientId].push(socket.id);
        } else { // nếu người dùng đăng nhập lần đầu
            clientsObj[clientId] = [socket.id];
        }

        clients.push(clientId);
        // khởi tạo clientId bằng id của client vừa gửi lên
        socket.clientId = clientId;
        // loại bỏ phần tử trùng lặp
        // var listClients = [...clients.reduce((p,c) => p.set(c,true),new Map()).keys()];
        // gửi mảng chứa danh sách online đến các client còn lại
        io.sockets.emit("list-clients-online", clients);

        // ============== CLIENT NGẮT KẾT NỐI ================
        socket.on("disconnect", function(){
            console.log(socket.id + " -> Disconnected!");
            // loại bỏ id của client vừa logout khỏi mảng online
            var clientLogOut = clients.indexOf(socket.clientId);
            if (clientLogOut != -1) {
                clients.splice(clientLogOut, 1);
            }
            // loại bỏ mảng của client disconect (load lại trang hoặc mở tab mới)
            clientsObj[clientId] = clientsObj[clientId].filter(socketId => {
                return socketId !== socket.id;
            })
            // nếu client đăng xuất thì xóa luôn mảng của client đó
            if (!clientsObj[clientId].length) {
                delete clientsObj[clientId]
            }
            
            // gửi lại mảng danh sách online cho client sau khi cập nhật
            io.sockets.emit("list-clients-online", clients); 
        });

        // ========== KẾT BẠN (ADD NEW CONTACT) ==========
        // lắng nghe yêu cầu kết bạn từ client
        socket.on("add-new-contact", function(data) {
            // gửi yêu cầu đến socketId của client nhận được lời mời kết bạn | nếu client mở 2 tab thì sẽ nhận được ở cả 2 ^^
            if (clientsObj[data.contactId]) {
                clientsObj[data.contactId].forEach(socketId => {
                    io.sockets.connected[socketId].emit("server-send-add-new-contact", data);
                });
            }
        })
        // lắng nghe sự kiện hủy yêu cầu kết bạn của người gửi
        socket.on("remove-request-contact-sent", function(data) {
            if (clientsObj[data.contactId]) {
                clientsObj[data.contactId].forEach(socketId => {
                    io.sockets.connected[socketId].emit("server-send-remove-request-contact-sent", data);
                });
            }
        })
        // lắng nghe sự kiện hủy yêu cầu kết bạn của người nhận
        socket.on("remove-request-contact-received", function(data) {
            if (clientsObj[data.contactId]) {
                clientsObj[data.contactId].forEach(socketId => {
                    io.sockets.connected[socketId].emit("server-send-remove-request-contact-received", data);
                });
            }
        })
        // lắng nghe đồng ý kết bạn
        socket.on("acccept-contact-received", function(data) {
            // nếu người được vừa thêm bạn đang online
            if (clientsObj[data.contactId]) {
                clientsObj[data.contactId].forEach(socketId => {
                    io.sockets.connected[socketId].emit("server-send-acccept-contact-received", data);
                });
            } else { // nếu người được vừa thêm bạn đang offline thì trả về trạng thái
                // trả lại trạng thái hoạt động của người vừa được đồng cho chính người dùng hiện tại
                io.sockets.connected[socket.id].emit("server-send-acccept-contact-received-status", {offline: true, contactId: data.contactId});
            }
        })
        // lắng nghe sự kiện xóa bạn bè
        socket.on("remove-contact", function(data) {
            if (clientsObj[data.contactId]) {
                clientsObj[data.contactId].forEach(socketId => {
                    io.sockets.connected[socketId].emit("server-send-remove-contact", data);
                });
            }
        })

        // =============== VIDEO CHAT ================
        // lắng nghe người gọi kiểm tra xem người nghe có online không
        socket.on("caller-check-listener-online-or-not", function(data) {
            // chuyển mảng clients thành object
            let clientsObj = clients.reduce(function(o, val) { 
                o[val] = val;
                return o; 
            }, {});
            // nếu tồn tại Id của người nghe thì người đó đang online
            if (clientsObj[data.listenerId]){ // online
                let response = {
                    callerId: data.callerId,
                    listenerId: data.listenerId,
                    callerName: data.callerName
                };
                // console.log(response)
                // server gửi request yêu cầu lấy peerId của người nghe
                socket.broadcast.emit("server-request-peer-id-of-listener", response);
            } else { // offline
                socket.emit("listener-is-offline")
            }
        });

        // Lắng nghe client (người nghe) gửi data kèm peerId lên
        socket.on("listener-emit-peer-id-to-server", function(data) {
            // console.log(data)
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId
            };
            
            // chuyển mảng clients thành object
            let clientsObj = clients.reduce(function(o, val) { 
                o[val] = val;
                return o; 
            }, {});
            
            if (clientsObj[data.callerId]) { // kiểm tra người gọi, để người nghe gửi trả peerId
                // server gửi response kèm peerId của người nghe cho người gọi
                socket.broadcast.emit("server-send-peerId-of-listener-to-caller", response);
            }
        });

        // lắng nghe yêu cầu gọi của người gọi (caller)
        socket.on("caller-request-call-to-server", function(data) {
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId
            };
            
            // chuyển mảng clients thành object
            let clientsObj = clients.reduce(function(o, val) { 
                o[val] = val;
                return o; 
            }, {});
            
            if (clientsObj[data.listenerId]) { // kiểm tra người nghe, để người nghe biết được có người gọi
                // gửi response kèm yêu cầu gọi của người gọi tới người nghe
                socket.broadcast.emit("server-send-request-call-to-listener", response);
            }
        });

        // Lắng nghe người gọi (caller) hủy yêu cầu gọi
        socket.on("caller-cancel-request-call-to-server", function(data) {
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId
            };
            
            // chuyển mảng clients thành object
            let clientsObj = clients.reduce(function(o, val) { 
                o[val] = val;
                return o; 
            }, {});
            
            if (clientsObj[data.listenerId]) { // kiểm tra người nghe, để người nghe biết được người gọi đã hủy
                // gửi response kèm yêu cầu hủy cuộc gọi của người gọi tới người nghe
                socket.broadcast.emit("server-send-cancel-request-call-to-listener", response);
            }
        });

        // lắng nghe người nghe (listener) từ chối cuộc gọi
        socket.on("listener-reject-request-call-to-server", function(data) {
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId
            };
            
            // chuyển mảng clients thành object
            let clientsObj = clients.reduce(function(o, val) { 
                o[val] = val;
                return o; 
            }, {});
            
            if (clientsObj[data.callerId]) { // kiểm tra người gọi, để người gọi biết được người nghe đã từ chối
                // gửi response kèm yêu cầu hủy cuộc gọi của người nghe tới người gọi
                socket.broadcast.emit("server-send-reject-call-to-caller", response);
            }
        });

        // lắng nghe người nghe chấp nhận cuộc gọi
        socket.on("listener-accept-request-call-to-server", function(data) {
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId
            };
            
            // chuyển mảng clients thành object
            let clientsObj = clients.reduce(function(o, val) { 
                o[val] = val;
                return o; 
            }, {});
            
            if (clientsObj[data.callerId]) { // kiểm tra người gọi, để người gọi biết được người nghe đã chấp nhận
                // gửi response kèm chấp nhận cuộc gọi của người nghe tới người gọi
                io.sockets.emit("server-send-accept-call-to-caller", response);
            }
            if (clientsObj[data.listenerId]) {
                // khi chấp nhận cuộc gọi, cả người nghe và người gọi đều sẽ mở cuộc gọi, nên sẽ gửi dữ liệu đến cả 2
                io.sockets.emit("server-send-accept-call-to-listener", response);
            }
        });

        // lắng nghe người gọi dừng cuộc gọi
        socket.on("caller-send-stop-call-to-server", function(data){
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId
            };
            
            // chuyển mảng clients thành object
            let clientsObj = clients.reduce(function(o, val) { 
                o[val] = val;
                return o; 
            }, {});

            if (clientsObj[data.listenerId]) { // kiểm tra người gọi, để người gọi biết được người nghe đã chấp nhận
                // gửi sự kiện dừng cuộc gọi tới người gọi
                io.sockets.emit("server-send-stop-call-to-listener", response);
            }
        })

        // lắng nghe người nghe dừng cuộc gọi
        socket.on("listener-send-stop-call-to-server", function(data){
            let response = {
                callerId: data.callerId,
                listenerId: data.listenerId,
                callerName: data.callerName,
                listenerName: data.listenerName,
                listenerPeerId: data.listenerPeerId
            };
            
            // chuyển mảng clients thành object
            let clientsObj = clients.reduce(function(o, val) { 
                o[val] = val;
                return o; 
            }, {});

            if (clientsObj[data.callerId]) { // kiểm tra người gọi, để người gọi biết được người nghe đã chấp nhận
                // gửi sự kiện dừng cuộc gọi tới người gọi
                io.sockets.emit("server-send-stop-call-to-caller", response);
            }
        })
        // ============= KẾT THÚC VIDEO CHAT ====================

        // console.log(socket.adapter.rooms); // show ra tất cả các room đang có

        // ============= SEND MESSAGES TEXT ==============
        // lắng nghe client gửi tin nhắn (kèm emoji) lên
        socket.on("chat-text-emoji", function(data) {
            // io.sockets.emit("send-back-data-chat", data); // gửi lại tn đến tất cả client
            socket.broadcast.emit("send-back-data-chat", data); // gửi đến các client còn lại, trừ người gửi
        })

        // ============== IMAGE CHAT ================
        socket.on("image-chat", function(data) {
            socket.broadcast.emit("server-send-back-data-image-chat", data);
        })

        // =============== TYPING ===================
        // lắng nghe sự kiện client đang nhập tin nhắn
        socket.on("client-is-typing", function(typingData) {
            socket.broadcast.emit("server-send-back-typing", typingData);
        })
        // lắng nghe sự kiện client ngừng nhập tin nhắn
        socket.on("client-stop-typing", function(typingData) {
            socket.broadcast.emit("server-send-back-stop-typing", typingData);
        })

        // ============== ATTACHMENT CHAT ================
        socket.on("attachment-chat", function(data) {
            socket.broadcast.emit("server-send-back-data-attachment-chat", data);
        })

        // ============== GROUP CHAT ================
        // lắng nghe sự kiện client tạo group mới
        socket.on("new-group-created", function(data) {
            // console.log(data.groupChat);
            socket.broadcast.emit("send-back-data-group-chat", data);
        })
    })
});
// ===============================================================
// ===============================================================

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}
