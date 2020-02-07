const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const nsp = io.of('/chatrooms');
const port = 4000;
const users = {};

app.use(express.static(__dirname + '/public'))

nsp.on('connection', socket => {

    socket.on('disconnect', () => {
        let user = users[socket.id];

        delete users[socket.id];
        nsp.emit('userleave', user);

        console.log(`${user.username} has left. There are ${Object.keys(users).length} user(s) in the room.`);
    });

    socket.on('userregister', user => {
        users[socket.id] = user;
        nsp.emit('userjoin', user);
        console.log(`${user.username} joined. There are ${Object.keys(users).length} user(s) in the room.`);
    });

    socket.on('messagereceive', chat => nsp.emit('messagereceive', chat));
});

server.listen(process.env.PORT || port, _ => console.log('Server listening on *:' + port));