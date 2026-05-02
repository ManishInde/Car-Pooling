const express = require('express');
const cors = require('cors');
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const pool = require('./db');

const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Carpooling API is running' });
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_trip_room', (tripId) => {
        socket.join(tripId);
        console.log(`User joined trip room: ${tripId}`);
    });

    socket.on('send_message', async (data) => {
        const { trip_id, user_id, text, username } = data;

        try {
            const savedMsg = await pool.query(
                `INSERT INTO messages (trip_id, user_id, text) VALUES ($1, $2, $3) RETURNING *`,
                [trip_id, user_id, text]
            );

            io.to(trip_id).emit('receive_message', { ...savedMsg.rows[0], username });
        } catch (err) {
            console.error("Error saving message", err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
