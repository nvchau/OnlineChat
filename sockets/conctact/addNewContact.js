/**
 * 
 * @param io from socket.io lib
 */

let addNewContact = (io) => {
    io.on("connection", function(socket) {
        console.log('Co nguoi truy cap: '+socket.id);
        socket.on();
    });
}

module.exports = addNewContact;