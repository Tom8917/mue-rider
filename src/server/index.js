const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')

const app = express()
const db = new Database('scores.db')

app.use(cors())
app.use(express.json())

db.prepare(`
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        best_score INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run()

app.get('/scores', (req, res) => {
    const scores = db.prepare(`
        SELECT username, best_score
        FROM scores
        ORDER BY best_score DESC
        LIMIT 5
    `).all()

    res.json(scores)
})

app.post('/scores', (req, res) => {
    const { username, score } = req.body

    if (!username || typeof score !== 'number') {
        return res.status(400).json({ error: 'username et score requis' })
    }

    const existing = db.prepare(`
        SELECT * FROM scores WHERE username = ?
    `).get(username)

    if (existing) {
        if (score > existing.best_score) {
            db.prepare(`
                UPDATE scores SET best_score = ? WHERE username = ?
            `).run(score, username)
        }
    } else {
        db.prepare(`
            INSERT INTO scores (username, best_score)
            VALUES (?, ?)
        `).run(username, score)
    }

    res.json({ success: true })
})

app.listen(3001, () => {
    console.log('Score API lancée sur http://localhost:3001')
})