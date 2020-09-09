const createError = require('http-errors');
const express = require('express');
const path = require('path');

const config = require('./settings');
const socketController = require('./contollers/sockets');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const io = require('socket.io')(chatServer);

const app = express();

const chatServer = require('http').createServer(app);
chatServer.listen(app.get('port'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// View engine setup:
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set configurations:
app.set('port', config.port);
app.set('trust proxy', 1) // trust first proxy

global.users = [];

io.use((socket, next) => {
  let token = socket.handshake.query.username;

  return (token) ? next() : next(new Error('Authentication error'));
});

io.on('connection', (client) => {
  let token = client.handshake.query.username;
  
  socketController.disconnect(client);

  users.push({
    id: client.id,
    name: token
  });
  
  socketController.onTyping(io, client);
  socketController.onStopTyping(io, client);
  socketController.onMessage(io, client);
  socketController.onNewUser(io);
});

// Catch 404 and forward to error handler:
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler:
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page:
  res.status(err.status || 500);
  res.render('error');
});