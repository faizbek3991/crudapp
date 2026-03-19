const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const TaskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend (static files)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/tasks', TaskRoutes);

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

