require('dotenv').config();
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000;

const { Pool, Client } = require('pg');
// pools will use environment variables
// for connection information
// const pool = new Pool({
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

const chatServer = io.of('/tech');

chatServer.on('connection', (socket) => {
  socket.on('join', (data) => {
    socket.join(data.room);
    chatServer.in(data.room).emit('message', `New user joined ${data.room}!`);
  });

  socket.on('message', (data) => {
    chatServer.in(data.room).emit('message', data.msg);
  });

  socket.on('disconnect', () => {
    chatServer.emit('message', 'user disconnected');
  });
});

// ! Postgres
// Create users table if it doesn't exist
// pool.query('CREATE TABLE IF NOT EXISTS users (id int PRIMARY KEY, username varchar(45) NOT NULL, password varchar(450) NOT NULL)', (err, res) => {
//   pool.end();
// });
