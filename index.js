// server.js
const express = require('express');
const app = express();
const PORT = 5500;
const cors = require('cors');
app.use(cors());

// Define a simple route
app.get('/api', (req, res) => {
    res.json({ data: 'Welcome to the backend!' });
});


var get_songs_file = require('./get_songs.js');
app.get('/get_songs', get_songs_file.get_songs);

var get_genres_file = require('./get_genres.js');
app.get('/get_genres', get_genres_file.get_genres);

app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
});