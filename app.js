const app = require('express')();
const path = require('path');

const config = require('./settings');
const socketController = require('./controllers/sockets');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const otherRouter = require('./routes/other');

const chatServer = require('http').createServer(app);
const io = require('socket.io')(chatServer);

// Routing:
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(otherRouter);

// View Engine setup:
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port', config.port);
app.set('trust proxy', 1) // trust first proxy

global.users = [];

// Validate username:
io.use((socket, next) => {
  let token = socket.handshake.query.username;

  return (token) ? next() : next(new Error('Authentication error'));
});

io.on('connection', (client) => {
  let token = client.handshake.query.username;

  // Create public key of the new user:
  var key = createPublicKey(256);
  
  users.push({
    id: client.id,
    name: token,
    publicKey: key
  });

  client.emit('publicKey', { key });

  client.on('message', (data) => {
    users.forEach(cl => {
        if (data.to.trim() === cl.name) {
            io.to(cl.id).emit("message", data)
        }
    });
  });
  
  client.on('disconnect', () => {
    users = users.filter(function(item) {
      return item.id !== client.id
    });
  });

  socketController.onTyping(io, client);
  socketController.onStopTyping(io, client);
  socketController.onNewUserConnect(io, client, token);
});

chatServer.listen(app.get('port'), (e) => {
  var message;
  message = (e) ? `Server did not start. ${e}` : `Server started on *:${app.get('port')}`;

  console.log(message);
});

function createPublicKey(keyBits) {
  var key = [];
  const bytesAmount = keyBits / 16;
  
  for (let i = 0; i < bytesAmount; i++) {
    const floatNumber = Math.random() * (255 - 1) + 1;
    key.push(Math.floor(floatNumber));
  }

  return key;
}