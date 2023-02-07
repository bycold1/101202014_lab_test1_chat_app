const io = require('socket.io')();

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.emit('message', 'Hello, this is a message from the server!');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

socket.on('message', message => {
    console.log(message);
});
