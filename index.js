// ! Laad de .env file
require('dotenv').config();

// ! Laad de express,http en socket.io module
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// ! Check of de .env PORT variabele bestaat en gebruik anders 3000
const PORT = process.env.PORT || 3000;

// ! Vraag de chatAPI.js file op en gebruik de class in deze file
const chatAPI = require('./chatAPI.js');
// import chatAPI from './chatAPI.js';

// ! Importeer de postgreSQL module (van npm) en gebruik daarna de database URL van Heroku
const { Pool, Client } = require('pg');
const db_url = process.env.DATABASE_URL || process_db.parsed.DB_URL;

// ! Maak een "Client" aan waarmee je kan praten met de postgreSQL functies (uit de module) Gebruik hiervoor de Heroku URL (db_url)
// ! Zorg ervoor dat je ook zonder SSL connectie kan connecten
const client = new Client({
  connectionString: db_url,
  ssl: { rejectUnauthorized: false },
});

// ! Oude postgreSQL gegevens om te connecten met een localhost database
// const client = new Client({
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// ! Start de chatAPI zodat je de functies daarin kan gebruiken (functies uit chatAPI.js)
const api = new chatAPI(client);

// ! Check of de server opgestart met als poort = PORT
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ! Als iemand connect naar de http://localhost/ locatie, stuur hem dan door naar /public/index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// ! Als iemand connect naar de http://localhost/javascript locatie, stuur hem dan door naar /public/javascript.html
app.get('/javascript', (req, res) => {
  res.sendFile(__dirname + '/public/javascript.html');
});

// ! Start een socket (Zie het als categorie) genaamd "tech" waarin je meerdere rooms kan maken om in te chatten
const chatServer = io.of('/tech');

// ! Check of er iemand met een socket connect en maak variabele aan om later te kunnen gebruiken
chatServer.on('connection', (socket) => {
  let user, room;

  // ! Check of iemand een room wil joinen binnen die socket en sla de user/room op
  socket.on('join', (data, ack) => {
    user = data.user;
    room = data.room;

    // ! Zorg ervoor dat de gebruiker de room joint en dat hij/zij daarna de chat history terug krijgt. Ook stuur je als laatste een message waarin staat welke user welke room is gejoint
    socket.join(data.room);
    api
      .getChat()
      .then((res) => ack(res))
      .then(() => {
        chatServer.in(data.room).emit('join', `${data.user} joined ${data.room}!`);
      });
  });

  // ! Als er een message is gestuurd vanaf de gebruiker zet hem in de database en stuur hem naar alle gebruikers
  socket.on('message', (data) => {
    api.insertChat(data);
    chatServer.in(data.room).emit('message', data);
  });

  // ! Wanneer een gebruiker disconnect stuur dan een message naar alle mensen in de room dat hij gedisconnect is
  socket.on('disconnect', (data) => {
    chatServer.in(room).emit('disconnect', `${user} disconnected from the server`);
  });
});

// ! Database check of je kan connecten met de database
client
  .connect()
  .then((res) => console.log('Connected to database'))
  .catch((err) => console.log(err));

// ! Maak een tabel genaamd "users" aan als hij nog niet bestaat
client
  .query('CREATE TABLE users (id int PRIMARY KEY, username varchar(45) NOT NULL, password varchar(450) NOT NULL)')
  .then((res) => console.log('Table for users was created'))
  .catch((err) => console.error(err.message));

// ! Maak een tabel genaamd "chats" aan als hij nog niet bestaat
client
  .query('CREATE TABLE chats (user_id SERIAL PRIMARY KEY, user_name VARCHAR(255), room VARCHAR(255), chat_text TEXT, date_time TIMESTAMP)')
  .then((res) => console.log('Table for chats was created'))
  .catch((err) => console.error(err.message));

// ! Functies van de chatAPI class
// api.getChat().then((res) => console.log(res));
// api.insertChat(data).then((res) => console.log(res.rowCount));
