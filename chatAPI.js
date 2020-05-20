class chatAPI {
  constructor(client) {
    this.client = client;
  }

  getChat() {
    return this.client
      .query('SELECT * FROM chats LIMIT 10')
      .then((res) => res.rows)
      .catch((err) => err.message);
  }

  insertChat(data) {
    return this.client
      .query('INSERT INTO chats (user_name, room, chat_text, date_time) VALUES ($1, $2, $3, NOW())', [data.user, data.room, data.msg])
      .then((res) => res)
      .catch((err) => err.message);
  }
}

module.exports = chatAPI;
