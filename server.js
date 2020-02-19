const _ = require('lodash');
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

const usersCount = () => _.filter(users, { online: true }).length;

nsp.on('connection', socket => {
  socket.on('disconnect', () => {
    let user = _.find(users, u => u.socketId === socket.id);
    if (typeof user === 'undefined') return;

    user = _.set(users, [user.id], { ...users[user.id], online: false });
    nsp.emit('userleave', { user, users });

    console.log(`${user.first} ${user.last} left.`);
    console.log(`There are ${usersCount()} user(s) in the room.`);
  });

  socket.on('userregister', user => {
    _.set(users, [user.id], {
      ...user,
      socketId: socket.id,
      online: true
    });
    socket.emit('userregister', users[user.id]);
    nsp.emit('afteruserregister', { userId: user.id, users });

    console.log(`${user.first} ${user.last} joined.`);
    console.log(`There are ${usersCount()} user(s) in the room.`);
  });

  socket.on('messagesend', data => {
    socket.to(data.receiver.socketId).emit('messagereceive', data);
  });

  socket.on('keyboardactivity', data => {
    socket.to(data.socketId).emit('keyboardactivity', data.user);
  });

  socket.on('keyboardactivitystop', data => {
    socket.to(data.socketId).emit('keyboardactivitystop', data.user);
  });
});

server.listen(process.env.PORT || port, () =>
  console.log(`Server listening on *:${port}`)
);
