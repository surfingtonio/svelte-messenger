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

    delete users[socket.id];
    nsp.emit('userleave', user);

    console.log(
      `${user.username} has left. There are ${
        Object.keys(users).length
      } user(s) in the room.`
    );
  });

  socket.on('userregister', user => {
    users[socket.id] = user;

    socket.emit('userregister', user);
    nsp.emit('userjoin', { user, users });

    console.log(
      `${user.username} joined. There are ${
        Object.keys(users).length
      } user(s) in the room.`
    );
  });

  socket.on('chatreceive', chat => {
    socket.broadcast.emit('messagereceive', chat);
  });

  socket.on('keyboardactivity', user => {
    socket.broadcast.emit('keyboardactivity', user);
  });

  socket.on('keyboardactivitystop', user => {
    socket.broadcast.emit('keyboardactivitystop', user);
  });
});

server.listen(process.env.PORT || port, () =>
  console.log(`Server listening on *:${port}`)
);
