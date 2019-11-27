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

// lắng nghe client kết nối
io.on("connection", function(socket) {
    console.log('Have user connected: '+socket.id);
    socket.on("disconnect", function(){
        console.log(socket.id + "-> Disconnected!");
    });
    // console.log(socket.adapter.rooms); // show ra tất cả các room đang có

    // lắng nghe client gửi tin nhắn (kèm emoji) lên
    socket.on("chat-text-emoji", function(data) {
        // io.sockets.emit("send-back-data-chat", data); // gửi lại tn đến tất cả client
        socket.broadcast.emit("send-back-data-chat", data); // gửi đến các client còn lại, trừ người gửi
    })

    // lắng nghe sự kiện client tạo group mới
    socket.on("new-group-created", function(data) {
        // console.log(data.groupChat);
        socket.broadcast.emit("send-back-data-group-chat", data.groupChat);
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
