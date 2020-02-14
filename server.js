const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const nsp = io.of('/chatrooms');
const port = 4000;
const users = {};

app.use(express.static(`${__dirname}/public`));
app.use(
  '/css/fontawesome',
  express.static(`${__dirname}/node_modules/@fortawesome/fontawesome-free`)
);

nsp.on('connection', socket => {
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (typeof user === 'undefined') {
      return;
    }

    delete users[socket.id];
    nsp.emit('userleave', { user, users });

    console.log(
      `${user.username} has left. There are ${
        Object.keys(users).length
      } user(s) in the room.`
    );
  });

  socket.on('userregister', user => {
    const registeredUser = { ...user, socketId: socket.id };
    users[socket.id] = registeredUser;

    socket.emit('userregister', registeredUser);
    nsp.emit('afteruserregister', { socketId: socket.id, users });

    console.log(
      `${user.username} joined. There are ${
        Object.keys(users).length
      } user(s) in the room.`
    );
  });

  socket.on('messagesend', data => {
    // user: { id, username, avatar, socketId }
    // chat: { message: {content, time}, sender: <user>, receiver: <user> }
    socket.to(data.receiver.socketId).emit('messagereceive', data);
  });

  socket.on('keyboardactivity', data => {
    socket.to(data.receiver.socketId).emit('keyboardactivity', data);
  });

  socket.on('keyboardactivitystop', data => {
    socket.to(data.receiver.socketId).emit('keyboardactivitystop', data);
  });
});

server.listen(process.env.PORT || port, () =>
  console.log(`Server listening on *:${port}`)
);
