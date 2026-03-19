const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authMiddleware = require('./middleware/auth');
const TaskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend (static files)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Login endpoint (public)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = Buffer.from(`${username}:${password}`).toString('base64');
    res.json({ token });
});

// API routes (protected)
app.use('/api/tasks', authMiddleware, TaskRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('API is running');
});

//start server
const PORT = process.env.PORT || 5000;  

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });

