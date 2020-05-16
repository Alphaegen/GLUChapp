const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 3000;

const { Pool, Client } = require('pg');
// pools will use environment variables
// for connection information
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gluchatapp',
  password: 'wbbRf3&R^P$q6xV*4W42iL@t',
  port: 5432,
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/javascript', (req, res) => {
  res.sendFile(__dirname + '/public/javascript.html');
});

app.get('/swift', (req, res) => {
  res.sendFile(__dirname + '/public/swift.html');
});

app.get('/css', (req, res) => {
  res.sendFile(__dirname + '/public/css.html');
});

const tech = io.of('/tech');

tech.on('connection', (socket) => {
  socket.on('join', (data) => {
    socket.join(data.room);
    tech.in(data.room).emit('message', `New user joined ${data.room}!`);
  });

  socket.on('message', (data) => {
    tech.in(data.room).emit('message', data.msg);
  });

  socket.on('disconnect', () => {
    tech.emit('message', 'user disconnected');
  });
});

// Postgres
pool.query('CREATE TABLE IF NOT EXISTS users (id int PRIMARY KEY, username varchar(45) NOT NULL, password varchar(450) NOT NULL)', (err, res) => {
  pool.end();
});
