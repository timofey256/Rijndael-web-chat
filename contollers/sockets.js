function disconnect(clientSocket) {
    clientSocket.on('disconnect', () => {
        var clientid = client.id;
        for (var i = 0; i < users.length; i++)
          if (users[i].id && users[i].id == clientid) {
            users.splice(i, 1);
            break;
          }
      });
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

function onNewUser(io) {
    io.emit("newuser", {
        id: client.id,
        name: token
    });
};

module.exports = {
    disconnect,
    onTyping,
    onStopTyping,
    onMessage,
    onNewUser
}