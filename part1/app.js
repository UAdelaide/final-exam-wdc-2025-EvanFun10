const express = require('express');
const pool = require('./db');
const app = express();
const port = 8080;

// 1. Setup database
const setupDatabase = async () => {
  // ... (your current SQL setup and INSERTs)
};
setupDatabase();

// 2. === API ROUTES HERE ===

app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error in /api/dogs:', err);
    res.status(500).json({ error: 'Failed to retrieve dogs' });
  }
});

app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error in /api/walkrequests/open:', err);
    res.status(500).json({ error: 'Failed to retrieve open walk requests' });
  }
});

app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.username AS walker_username,
             COUNT(r.rating_id) AS total_ratings,
             ROUND(AVG(r.rating), 1) AS average_rating,
             COUNT(CASE WHEN wr.status = 'completed' THEN 1 END) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      LEFT JOIN WalkRequests wr ON wr.request_id = r.request_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error in /api/walkers/summary:', err);
    res.status(500).json({ error: 'Failed to retrieve walker summaries' });
  }
});

// 3. Start server
app.listen(port, () => {
  console.log(`DogWalkService running at http://localhost:${port}`);
});
