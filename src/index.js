const express = require('express');
const dotenv = require('dotenv');
const pool = require('../config/db'); // Adjust the path if necessary

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('CI/CD pipeline is working nowww!');
});

// Route to test database connectivity
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM SKUs LIMIT 1');
        res.json(result.rows);
    } catch (err) {
        console.error('Database query error:', err.message, err.stack);
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});