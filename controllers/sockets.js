function onTyping(io, clientSocket) {
    clientSocket.on('typing', (data) => {
        io.emit("typing", data)
    });
};

function onStopTyping(io, clientSocket) {
    clientSocket.on('stoptyping', (data) => {
        io.emit("stoptyping", data)
    });
};

function onNewUserConnect(io, client, token) {
    io.emit("newuser", {
        id: client.id,
        name: token
    });
};

module.exports = {
    onTyping,
    onStopTyping,
    onNewUserConnect
}