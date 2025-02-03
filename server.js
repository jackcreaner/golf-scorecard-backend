
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database('./golf-app.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT,
            total_score INTEGER
        )`);
    }
});

// API endpoints
app.get('/api/leaderboard', (req, res) => {
    db.all('SELECT * FROM leaderboard ORDER BY total_score DESC', [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/scores', (req, res) => {
    const { playerName, totalScore } = req.body;
    if (!playerName || totalScore === undefined) {
        return res.status(400).send('Player name and score are required.');
    }

    const query = 'INSERT INTO leaderboard (player_name, total_score) VALUES (?, ?)';
    db.run(query, [playerName, totalScore], function (err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json({ id: this.lastID, playerName, totalScore });
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
            