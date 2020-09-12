function onDisconnect(clientSocket, io) {
    
};

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

function onMessage(io, clientSocket) {
    clientSocket.on('message', (data) => {
        io.emit("message", data)
    });
};

function onNewUserConnect(io, client, token) {
    console.log(global.users);

    io.emit("newuser", {
        id: client.id,
        name: token
    });
};

module.exports = {
    onDisconnect,
    onTyping,
    onStopTyping,
    onMessage,
    onNewUserConnect
}