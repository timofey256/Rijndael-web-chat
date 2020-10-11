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

// Uses for creating general key in each conversation:
const publicKeys = { p : 341171, q : 342379 };

// Validate username:
io.use((socket, next) => {
  let token = socket.handshake.query.username;

  return (token) ? next() : next(new Error('Authentication error'));
});

io.on('connection', (client) => {
  let token = client.handshake.query.username;

  users.push({
    id: client.id,
    name: token
  });

  client.emit('publicKeys', { publicKeys });

  client.on('partialKey', (data) => {
    const toName = data.toName;
    const fromName = data.fromName;
    const partialKey = data.partialKey;

    users.forEach(user => {
      if (user.name === toName) {
        io.to(user.id).emit('partialKey', { from : fromName, partialKey });
      };
    });    
  });

  client.on('partialKeyResponse', (data) => {
    const toName = data.toName;
    const fromName = data.fromName;
    const partialKey = data.partialKey;

    console.log(`from: '${fromName}', to: '${toName}', partial: '${partialKey}'`);

    users.forEach(user => {
      if (user.name === toName) {
        io.to(user.id).emit('partialResponse', { from : fromName, partialKey });
      };
    });    
  })

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

// Function creates 'g' and 'p' numbers for Diffie-Hellman algorithm:
function createPublicKeys(keyBits) {
  var keys = [];

  for (let j = 0; j < 2; j++) {
    var key = [];
    const bytesAmount = keyBits / 16;
    
    for (let i = 0; i < bytesAmount; i++) {
      const floatNumber = Math.random() * (10 - 0) + 0;
      key.push(Math.floor(floatNumber));
    }

    keys.push(key);
  }
    
  return { g : keys[0], p : keys[1] };
}