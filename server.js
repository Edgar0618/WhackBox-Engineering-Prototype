const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/games', (req, res) => {
    res.render('games', { title: 'Games' });
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
    // For new connections in the lobby
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        socket.on('start-game', () => {
            io.in(roomId).emit('navigate-to-games', roomId);
        });
    });

    socket.on('rejoin-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    });

    socket.on('disconnect', userId => {
        socket.broadcast.emit('user-disconnected', userId);
    });
});

const port = process.argv[2] || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 