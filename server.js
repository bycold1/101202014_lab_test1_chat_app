const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.set('view engine', 'ejs');
app.set('public', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));



mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  room: String
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/chat', (req, res) => {
  res.render('chat');
});

const User = mongoose.model('User', userSchema);

io.on('connection', socket => {
  console.log('New socket connection');
  socket.emit('message', 'Welcome to chat');

  socket.on('signup', async data => {
    try {
      const user = new User({
        username: data.username,
        password: data.password
      });
      await user.save();
      socket.emit('signupSuccess');
    } catch (error) {
      console.error(error);
      socket.emit('signupError', error.message);
    }
  });

 



  socket.on('leaveRoom', async data => {
    try {
      const user = await User.findOne({ username: data.username });
      if (!user) {
        throw new Error('User not found');
      }
      user.room = '';
      await user.save();
      socket.leave(data.room);
      socket.emit('leaveRoomSuccess');
    } catch (error) {
      console.error(error);
      socket.emit('leaveRoomError', error.message);
    }
  });

  socket.on('sendMessage', data => {
    socket.to(data.room).emit('message', `${data.username}: ${data.text}`);
  });
  });
  
  const PORT = 3000 || process.env.PORT;
  
  server.listen(PORT, () => console.log(`Running on Port ${PORT}`));
