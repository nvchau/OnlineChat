#!/usr/bin/env node

/**
 * Module dependencies.
 */

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

// mảng chưa id tất cả client online
let clients = [];
// lắng nghe client kết nối
io.on("connection", function(socket) {
    console.log('Have user connected: '+socket.id);
    // lắng nghe mỗi khi đăng nhập client sẽ gửi id lên
    socket.on("client-login", function(clientId) {
        if (!clients[clientId]){
            clients.push(clientId);
            // khởi tạo clientId bằng id của client vừa gửi lên
            socket.clientId = clientId;
        }
        // loại bỏ phần tử trùng lặp
        // var listClients = [...clients.reduce((p,c) => p.set(c,true),new Map()).keys()];
        // gửi mảng chứa danh sách online đến các client còn lại
        io.sockets.emit("list-clients-online", clients);
        // ============== CLIENT NGẮT KẾT NỐI ================
        socket.on("disconnect", function(){
            console.log(socket.id + " -> Disconnected!");
            var clientLogOut = clients.indexOf(socket.clientId);
            if (clientLogOut != -1) {
                clients.splice(clientLogOut, 1);
            }
            // gửi lại mảng danh sách online cho client sau khi cập nhật
            io.sockets.emit("list-clients-online", clients); 
        });
    })

    // console.log(socket.adapter.rooms); // show ra tất cả các room đang có

    // ============= SEND MESSAGES ==============
    // lắng nghe client gửi tin nhắn (kèm emoji) lên
    socket.on("chat-text-emoji", function(data) {
        // io.sockets.emit("send-back-data-chat", data); // gửi lại tn đến tất cả client
        socket.broadcast.emit("send-back-data-chat", data); // gửi đến các client còn lại, trừ người gửi
    })

    // ============== GROUP CHAT ================
    // lắng nghe sự kiện client tạo group mới
    socket.on("new-group-created", function(data) {
        // console.log(data.groupChat);
        socket.broadcast.emit("send-back-data-group-chat", data);
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

    // =============== VIDEO CHAT ================
    // lắng nghe người gọi kiểm tra xem người nghe có online không
    socket.on("caller-check-listener-online", function(data) {

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
