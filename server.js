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

app.get('/game1', (req, res) => {           //added route for games 1-3
    res.render('game1');
});

app.get('/game2', (req, res) => {
    res.render('game2');
});

app.get('/game3', (req, res) => {
    res.render('game3');
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
    // For new connections in the lobby
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        socket.on('start-game', () => {                         //added individual game navigation
            io.in(roomId).emit('navigate-to-games', roomId);
        });

        socket.on('start-game1', () => {
            io.in(roomId).emit('navigate-to-game1', roomId);
        });

        socket.on('start-game2', () => {
            io.in(roomId).emit('navigate-to-game2', roomId);
        });

        socket.on('start-game3', () => {
            io.in(roomId).emit('navigate-to-game3', roomId);
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

