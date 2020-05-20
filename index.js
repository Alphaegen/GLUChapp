require('dotenv').config();
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000;
import chatAPI from './chatAPI';

const { Pool, Client } = require('pg');

// DB Connection info
const client = new Client({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const api = new chatAPI(client);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/javascript', (req, res) => {
  res.sendFile(__dirname + '/public/javascript.html');
});

const chatServer = io.of('/tech');

chatServer.on('connection', (socket) => {
  let user, room;

  socket.on('join', (data, ack) => {
    user = data.user;
    room = data.room;
    // ! Send chat history from DB
    socket.join(data.room);
    api
      .getChat()
      .then((res) => ack(res))
      .then(() => {
        chatServer.in(data.room).emit('join', `${data.user} joined ${data.room}!`);
      });
  });

  socket.on('message', (data) => {
    api.insertChat(data);
    chatServer.in(data.room).emit('message', data);
  });

  socket.on('disconnect', (data) => {
    chatServer.in(room).emit('disconnect', `${user} disconnected from the server`);
  });
});

// ! Postgres
client
  .connect()
  .then((res) => console.log('Connected to database'))
  .catch((err) => console.log(err));

// Create users table if it doesn't exist
client
  .query('CREATE TABLE users (id int PRIMARY KEY, username varchar(45) NOT NULL, password varchar(450) NOT NULL)')
  .then((res) => console.log('Table for users was created'))
  .catch((err) => console.error(err.message));

// Create chats table if it doesn't exist
client
  .query('CREATE TABLE chats (user_id SERIAL PRIMARY KEY, user_name VARCHAR(255), room VARCHAR(255), chat_text TEXT, date_time TIMESTAMP)')
  .then((res) => console.log('Table for chats was created'))
  .catch((err) => console.error(err.message));

// ! API Class function calls
// api.getChat().then((res) => console.log(res));
// api.insertChat(data).then((res) => console.log(res.rowCount));
