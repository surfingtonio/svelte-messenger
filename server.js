const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 4000;

app.use(express.static(__dirname + '/public'))

io.on('connection', socket => {
    console.log('Client connected.');
    socket.on('disconnect', () => console.log('Client disconnected.'));

    socket.on('incomingMessage', chat => io.emit('incomingMessage', chat));
});

server.listen(process.env.PORT || port, _ => console.log('Server listening on *:' + port));