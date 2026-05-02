const pool = require('../db');

const createTrip = async (req, res) => {
    try {
        const { origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, departure_time, seats_available, price } = req.body;

        const newTrip = await pool.query(
            `INSERT INTO trips (driver_id, origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, departure_time, seats_available, price)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [req.user.id, origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, departure_time, seats_available, price]
        );

        res.status(201).json({
            message: 'Trip created succesfully',
            trip: newTrip.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error ' });
    }
};

const getAllTrips = async (req, res) => {
    try {
        const trips = await pool.query(
            'SELECT * FROM trips ORDER BY departure_time ASC'
        );

        res.status(200).json({ trips: trips.rows });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

const joinTrip = async (req, res) => {
    try {
        const tripId = req.params.id;


        const tripUpdate = await pool.query(
            `UPDATE trips 
             SET seats_available = seats_available - 1 
             WHERE id = $1 AND seats_available > 0 
             RETURNING *`,
            [tripId]
        );


        if (tripUpdate.rows.length === 0) {
            return res.status(400).json({ error: 'Trip is full or does not exist!' });
        }


        const booking = await pool.query(
            `INSERT INTO bookings (trip_id, passenger_id)
            VALUES ($1, $2) RETURNING *`,
            [tripId, req.user.id]
        );

        res.status(201).json({
            message: 'Trip Joined Successfully',
            booking: booking.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

const getTripMessages = async (req, res) => {
    try {
        const tripId = req.params.id;

        const messages = await pool.query(
            `SELECT messages.*, users.name as username
            FROM messages
            JOIN users ON messages.user_id = users.id
            WHERE trip_id = $1
            ORDER BY created_at ASC`,
            [tripId]
        );

        res.status(200).json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = { createTrip, getAllTrips, joinTrip, getTripMessages };